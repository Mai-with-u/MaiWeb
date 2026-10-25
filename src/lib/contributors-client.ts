// 贡献者头像的浏览器端兜底。
// 触发条件：构建时没拿到贡献者列表（构建机被 GitHub 限流、网络超时等），页面上的头像容器带着待填充标记。
// 处理顺序：先读本标签页的会话缓存 -> 没有再请求 GitHub 接口 -> 只保留真人账号、只接受 GitHub 头像域名 -> 写回缓存。
// 未登录接口按访客自己的 IP 计算每小时 60 次额度，基本不会失败；失败就返回空数组，页面保持没有头像的样子。

export interface BrowserContributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}

const API = 'https://api.github.com/repos/Mai-with-u/MaiBot/contributors?per_page=100';
const CACHE_KEY = 'maiweb-contributors-v1';

function isGitHubAsset(value: string | undefined, host: string): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === host;
  } catch {
    return false;
  }
}

export async function fetchContributorsInBrowser(): Promise<BrowserContributor[]> {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached) as BrowserContributor[];
  } catch {
    // 读不到缓存就直接请求
  }

  try {
    const response = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) return [];
    const data = (await response.json()) as { login?: string; avatar_url?: string; html_url?: string; type?: string }[];
    const list = data
      .filter(
        (item) =>
          item.type === 'User' &&
          item.login &&
          isGitHubAsset(item.avatar_url, 'avatars.githubusercontent.com') &&
          isGitHubAsset(item.html_url, 'github.com')
      )
      .map((item) => ({
        login: item.login!,
        // 头像只按 48px 左右展示，请求 96px 兼顾高分屏
        avatarUrl: `${item.avatar_url}${item.avatar_url!.includes('?') ? '&' : '?'}s=96`,
        profileUrl: item.html_url!,
      }));
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch {
      // 隐私模式下可能无法写入，只是下次进入要重新请求
    }
    return list;
  } catch {
    return [];
  }
}

// 给脚本动态创建的元素补上组件的作用域属性（data-astro-cid-xxx），否则组件内的 scoped 样式不会作用到它们身上
export function copyScope(from: Element, to: Element) {
  for (const attribute of Array.from(from.attributes)) {
    if (attribute.name.startsWith('data-astro-cid-')) to.setAttribute(attribute.name, '');
  }
}
