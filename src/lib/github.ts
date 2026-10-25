import { GITHUB_TOKEN } from 'astro:env/server';

// 构建时向 GitHub 拉取社区统计（提交数、已关闭 issue、贡献者、插件数量）。
// 触发时机：衍生项目页和关于页在构建阶段渲染时调用；同一次构建只请求一次，结果在模块内缓存。
// 失败策略：每个数字单独兜底，接口超时、限流或返回异常时用下面的快照值，页面永远不会因此构建失败。
// 构建环境配置了 GITHUB_TOKEN 时带上它，避免未登录请求每小时 60 次的限流。

const REPO = 'Mai-with-u/MaiBot';
const PLUGIN_INDEX = 'https://raw.githubusercontent.com/Mai-with-u/plugin-repo/main/plugins.json';
const TIMEOUT_MS = 8000;

// 2026-10-25 的快照，仅在接口不可用时展示
const FALLBACK = {
  commits: 7995,
  closedIssues: 990,
  contributors: 116,
  plugins: 433,
};

export interface CommunityStats {
  commits: number;
  closedIssues: number;
  contributors: number;
  plugins: number;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}

function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'MaiWeb-build',
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

async function request(url: string): Promise<Response> {
  const response = await fetch(url, { headers: apiHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return response;
}

// 列表接口按 per_page=1 请求时，Link 头里 rel="last" 的页码就是总条数
async function countByLastPage(url: string): Promise<number> {
  const response = await request(url);
  const match = response.headers.get('link')?.match(/[?&]page=(\d+)>;\s*rel="last"/);
  if (match) return Number(match[1]);
  const items = (await response.json()) as unknown[];
  return items.length;
}

async function countClosedIssues(): Promise<number> {
  const query = encodeURIComponent(`repo:${REPO} type:issue state:closed`);
  const response = await request(`https://api.github.com/search/issues?q=${query}&per_page=1`);
  const data = (await response.json()) as { total_count?: number };
  if (typeof data.total_count !== 'number') throw new Error('search total_count missing');
  return data.total_count;
}

async function countPlugins(): Promise<number> {
  const response = await fetch(PLUGIN_INDEX, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`plugins.json -> ${response.status}`);
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) throw new Error('plugins.json is not an array');
  return data.length;
}

function settled(result: PromiseSettledResult<number>, fallback: number, label: string): number {
  if (result.status === 'fulfilled' && result.value > 0) return result.value;
  console.warn(`[github] ${label} 获取失败，使用快照值 ${fallback}`);
  return fallback;
}

let statsPromise: Promise<CommunityStats> | undefined;
let contributorsPromise: Promise<Contributor[]> | undefined;

export function getCommunityStats(): Promise<CommunityStats> {
  statsPromise ??= (async () => {
    const [commits, closedIssues, contributors, plugins] = await Promise.allSettled([
      countByLastPage(`https://api.github.com/repos/${REPO}/commits?per_page=1`),
      countClosedIssues(),
      countByLastPage(`https://api.github.com/repos/${REPO}/contributors?per_page=1`),
      countPlugins(),
    ]);
    return {
      commits: settled(commits, FALLBACK.commits, '提交数'),
      closedIssues: settled(closedIssues, FALLBACK.closedIssues, '已关闭 issue 数'),
      contributors: settled(contributors, FALLBACK.contributors, '贡献者数'),
      plugins: settled(plugins, FALLBACK.plugins, '插件数'),
    };
  })();
  return statsPromise;
}

// 贡献者头像墙：只取真人账号（排除 dependabot 等机器人），失败时返回空数组，页面据此隐藏头像墙
export function getContributors(): Promise<Contributor[]> {
  contributorsPromise ??= (async () => {
    try {
      const response = await request(`https://api.github.com/repos/${REPO}/contributors?per_page=100`);
      const data = (await response.json()) as {
        login?: string;
        avatar_url?: string;
        html_url?: string;
        type?: string;
      }[];
      return data
        .filter((item) => item.type === 'User' && item.login && item.avatar_url && item.html_url)
        .map((item) => ({
          login: item.login!,
          // 头像只按 48px 左右展示，请求 96px 兼顾高分屏
          avatarUrl: `${item.avatar_url}${item.avatar_url!.includes('?') ? '&' : '?'}s=96`,
          profileUrl: item.html_url!,
        }));
    } catch (error) {
      console.warn(`[github] 贡献者列表获取失败，隐藏头像墙：${(error as Error).message}`);
      return [];
    }
  })();
  return contributorsPromise;
}

// 统计数字展示格式：上千显示为 7.9K+，其余向下取整到十位，例如 116 -> 110+
export function formatCount(value: number): string {
  if (value >= 1000) return `${Math.floor(value / 100) / 10}K+`;
  if (value >= 10) return `${Math.floor(value / 10) * 10}+`;
  return String(value);
}
