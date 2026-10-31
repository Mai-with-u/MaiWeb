import { links } from '../data/links.ts';

// 官网下载入口，线上由 src/worker.ts 调用，本地开发由 astro.config.mjs 的中间件调用。
//   /downloads/<应用>         按访客地区自动选源：中国大陆先走 CNB，CNB 不行再走 GitHub；其他地区直接走 GitHub
//   /downloads/<应用>/cnb     用户在弹窗里点名要 CNB：只查 CNB，查不到返回 503，提示改选 GitHub
//   /downloads/<应用>/github  用户点名要 GitHub：只查 GitHub，接口查不到时跳到 GitHub 发布页
//   /downloads/latest.json    按自动选源的规则返回各安装包的版本号，首页弹窗的版本标签用它
// 下载地址一律由固定仓库、版本号和附件名拼出来，不采用清单或接口里返回的任意链接。

export type DownloadApp = 'onekey' | 'maidroid';
export type DownloadSource = 'cnb' | 'github';
export type Download = { version: string; source: DownloadSource; url: string };
type Fetcher = (_url: string, _init: RequestInit & { cf?: Record<string, unknown> }) => Promise<Response>;
export type DownloadOptions = { country?: string | null; fetcher?: Fetcher };

type AppConfig = {
  // GitHub 和 CNB 上的仓库路径相同
  repo: string;
  installer: RegExp;
  canonical: (_tag: string) => string;
  // 所有源都查不到时的落脚点，用户在发布页上手动挑安装包
  releasesPage: string;
};

const APPS: Record<DownloadApp, AppConfig> = {
  // Windows 一键包：标准安装包名里的版本号不带 v；同一版本可能另有 -win-snowluma.exe 之类的变体包
  onekey: {
    repo: 'Mai-with-u/MaiBotOneKey',
    installer: /^[\w .-]+\.exe$/i,
    canonical: (tag) => `MaiBot-OK-${tag.replace(/^v/, '')}-win.exe`,
    releasesPage: links.oneKeyLatest,
  },
  // Android 客户端：标签带 v，安装包名原样带上标签；调试包和未签名包不给普通用户
  maidroid: {
    repo: 'Mai-with-u/MaiDroid',
    installer: /^(?!.*(?:debug|unsigned))[\w .-]+\.apk$/i,
    canonical: (tag) => `MaiDroid_${tag}.apk`,
    releasesPage: links.droidReleases,
  },
};

const APP_IDS = Object.keys(APPS) as DownloadApp[];
const ROUTE = /^\/downloads\/(?:latest\.json|(?<app>onekey|maidroid)(?:\/(?<source>cnb|github))?)\/?$/;
const TAG = /^v?\d+\.\d+\.\d+$/;
const TIMEOUT = 5000;
const HEADERS = { 'Cache-Control': 'no-store' };

type JsonObject = Record<string, unknown>;
type JsonAsset = JsonObject & { name: string; size: number };
const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null;

// 在一个版本的附件里挑安装包：先认标准文件名，没有时只在唯一候选时采用；
// 候选有多个又没有标准名时宁可报错换源，也不猜一个给用户。GitHub 上还没传完的附件不算。
function pickInstaller(app: AppConfig, tag: string, assets: unknown): string {
  if (!Array.isArray(assets)) throw new Error('Missing assets');
  const names = assets
    .filter(
      (asset): asset is JsonAsset =>
        isObject(asset) &&
        typeof asset.name === 'string' &&
        app.installer.test(asset.name) &&
        typeof asset.size === 'number' &&
        asset.size > 0 &&
        (asset.state === undefined || asset.state === 'uploaded')
    )
    .map((asset) => asset.name);
  const canonical = app.canonical(tag).toLowerCase();
  const name = names.find((item) => item.toLowerCase() === canonical) ?? (names.length === 1 ? names[0] : undefined);
  if (!name) throw new Error('Missing or ambiguous installer');
  return name;
}

// CNB：以 CNB 自己发布的 latest.json 为准。GitHub 上更新的版本可能还没同步过去，
// 这时宁可给用户 CNB 上已经传完的旧版，也不拼一个 CNB 上还不存在的新版地址。
export function readCnbManifest(appId: DownloadApp, value: unknown): Download {
  const app = APPS[appId];
  if (!isObject(value) || value.schema !== 1 || typeof value.latestTag !== 'string' || !Array.isArray(value.releases)) {
    throw new Error('Invalid CNB manifest');
  }
  const tag = value.latestTag;
  if (!TAG.test(tag)) throw new Error('Invalid release tag');
  const release = value.releases.find((item) => isObject(item) && item.tag_name === tag);
  if (!isObject(release)) throw new Error('Missing latest release');
  const name = pickInstaller(app, tag, release.assets);
  const url = `https://cnb.cool/${app.repo}/-/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`;
  return { version: tag, source: 'cnb', url };
}

// GitHub：/releases/latest 只返回最新正式版，不含预发布和草稿
export function readGitHubRelease(appId: DownloadApp, value: unknown): Download {
  const app = APPS[appId];
  if (!isObject(value) || typeof value.tag_name !== 'string' || value.draft === true) {
    throw new Error('Invalid GitHub release');
  }
  const tag = value.tag_name;
  if (!TAG.test(tag)) throw new Error('Invalid release tag');
  const name = pickInstaller(app, tag, value.assets);
  const url = `https://github.com/${app.repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`;
  return { version: tag, source: 'github', url };
}

const resolvers: Record<DownloadSource, (_appId: DownloadApp, _fetcher: Fetcher) => Promise<Download>> = {
  // CNB 清单每次都重新读取，同步工作流刚发布新版时立刻生效
  async cnb(appId, fetcher) {
    const response = await fetcher(`https://cnb.cool/${APPS[appId].repo}/-/git/raw/cnb-updates/latest.json`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!response.ok) throw new Error('CNB manifest unavailable');
    return readCnbManifest(appId, await response.json());
  },
  // GitHub 接口要求带 User-Agent。Worker 的出口 IP 和别人共用，未登录的每小时额度容易被占满，
  // 所以成功结果在 Cloudflare 边缘节点缓存 5 分钟，失败结果不缓存，下次请求重新查。
  async github(appId, fetcher) {
    const response = await fetcher(`https://api.github.com/repos/${APPS[appId].repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'maibot.chat' },
      signal: AbortSignal.timeout(TIMEOUT),
      cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 300, '300-599': -1 } },
    });
    if (!response.ok) throw new Error('GitHub release unavailable');
    return readGitHubRelease(appId, await response.json());
  },
};

// 按顺序尝试下载源，返回第一个查到的安装包；全部失败时返回 undefined，由调用方决定退路
async function resolveFirst(appId: DownloadApp, sources: DownloadSource[], fetcher: Fetcher) {
  for (const source of sources) {
    try {
      return await resolvers[source](appId, fetcher);
    } catch {
      // 当前源超时、限流或数据不完整，换下一个源
    }
  }
  return undefined;
}

// 中国大陆访客连 GitHub 常常很慢，先走 CNB；其他地区直接走 GitHub，CNB 在海外通常不比它快
const autoSources = (country?: string | null): DownloadSource[] => (country === 'CN' ? ['cnb', 'github'] : ['github']);

const found = (location: string) => new Response(null, { status: 302, headers: { ...HEADERS, Location: location } });

async function redirect(
  request: Request,
  appId: DownloadApp,
  source: DownloadSource | undefined,
  country: string | null | undefined,
  fetcher: Fetcher
): Promise<Response> {
  if (source === 'cnb') {
    const download = await resolveFirst(appId, ['cnb'], fetcher);
    if (download) return found(download.url);
    return new Response(
      request.method === 'HEAD'
        ? null
        : 'CNB 下载暂时不可用，请返回官网选择 GitHub 源。\nCNB is temporarily unavailable. Please return to MaiBot and choose GitHub.',
      { status: 503, headers: { ...HEADERS, 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
  const download = await resolveFirst(appId, source ? [source] : autoSources(country), fetcher);
  return found(download?.url ?? APPS[appId].releasesPage);
}

// 版本号和跳转用同一套选源规则，弹窗上显示的版本就是点下载时拿到的版本；查不到的应用给 null
async function latestVersions(request: Request, country: string | null | undefined, fetcher: Fetcher) {
  const entries = await Promise.all(
    APP_IDS.map(async (appId) => {
      const download = await resolveFirst(appId, autoSources(country), fetcher);
      return [appId, download ? { version: download.version, source: download.source } : null] as const;
    })
  );
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(Object.fromEntries(entries)), {
    headers: { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// 不是下载入口的路径返回 undefined，交回静态资源处理
export function handleDownloads(request: Request, options: DownloadOptions = {}): Promise<Response> | undefined {
  const match = ROUTE.exec(new URL(request.url).pathname);
  if (!match) return undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return Promise.resolve(
      new Response('Method not allowed', { status: 405, headers: { ...HEADERS, Allow: 'GET, HEAD' } })
    );
  }
  const { country, fetcher = fetch } = options;
  const app = match.groups?.app as DownloadApp | undefined;
  if (!app) return latestVersions(request, country, fetcher);
  return redirect(request, app, match.groups?.source as DownloadSource | undefined, country, fetcher);
}
