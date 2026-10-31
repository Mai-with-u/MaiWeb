// 全站外部链接的唯一来源：导航、首屏、弹窗、页脚、关于页都从这里取，
// 文档站或仓库改路径时只需要改这一个文件，避免同一个链接散落多处后各自过时。

const GITHUB_ORG = 'https://github.com/Mai-with-u';
const DOCS = 'https://docs.maibot.chat';

export const links = {
  // 主仓库与协议：首屏、页脚和关于页的“开源与协议”都指向这里
  repo: `${GITHUB_ORG}/MaiBot`,
  releases: `${GITHUB_ORG}/MaiBot/releases`,
  latestRelease: `${GITHUB_ORG}/MaiBot/releases/latest`,
  license: `${GITHUB_ORG}/MaiBot/blob/main/LICENSE`,
  eula: `${GITHUB_ORG}/MaiBot/blob/main/EULA.md`,
  privacy: `${GITHUB_ORG}/MaiBot/blob/main/PRIVACY.md`,
  org: GITHUB_ORG,

  // 文档站：文档站没有 /manual/deployment/ 索引页，“部署”入口统一落到“快速上手”
  docs: `${DOCS}/`,
  manual: `${DOCS}/manual/`,
  develop: `${DOCS}/develop/`,
  pluginDev: `${DOCS}/plugin/`,
  faq: `${DOCS}/faq/`,
  community: `${DOCS}/about/community`,
  acknowledgements: `${DOCS}/about/acknowledgements`,
  deployUv: `${DOCS}/manual/deployment/uv-tool`,
  deployDocker: `${DOCS}/manual/deployment/docker`,
  deployLinux: `${DOCS}/manual/deployment/linux`,
  deployWindows: `${DOCS}/manual/deployment/windows`,

  // 插件市场展示页（数据来自 plugin-repo 仓库）
  pluginMarket: 'https://plugin.maibot.chat/',
  pluginRepo: `${GITHUB_ORG}/plugin-repo`,

  // 安装包：首屏按设备推荐 Windows 一键包或 Android 安装包。
  // /downloads/ 开头的是官网自己的下载入口，由 Worker 选好 CNB 或 GitHub 再跳转（见 src/lib/downloads.ts）；
  // 两个发布页是所有源都查不到时的落脚点
  oneKeyRepo: `${GITHUB_ORG}/MaiBotOneKey`,
  oneKeyLatest: `${GITHUB_ORG}/MaiBotOneKey/releases/latest`,
  oneKeyDownload: '/downloads/onekey',
  oneKeyCnbDownload: '/downloads/onekey/cnb',
  oneKeyGitHubDownload: '/downloads/onekey/github',
  droidRepo: `${GITHUB_ORG}/MaiDroid`,
  droidReleases: `${GITHUB_ORG}/MaiDroid/releases`,
  droidDownload: '/downloads/maidroid',
  // 各安装包的最新版本号，和上面的下载入口用同一套选源规则
  downloadVersions: '/downloads/latest.json',

  // 本站仓库：404 页“报告问题”和衍生项目里的官网卡片
  siteRepo: `${GITHUB_ORG}/MaiWeb`,
  siteIssues: `${GITHUB_ORG}/MaiWeb/issues`,
} as const;

// 首屏版本卡片在浏览器端实时查询的 GitHub Releases 接口（安装包的版本号改由 downloadVersions 提供）
export const releaseApis = {
  core: 'https://api.github.com/repos/Mai-with-u/MaiBot/releases/latest',
} as const;
