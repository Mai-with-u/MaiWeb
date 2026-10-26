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

  // 安装包：首屏按设备推荐 Windows 一键包或 Android 安装包，接口失败时退回到这些发布页
  oneKeyRepo: `${GITHUB_ORG}/MaiBotOneKey`,
  oneKeyLatest: `${GITHUB_ORG}/MaiBotOneKey/releases/latest`,
  droidRepo: `${GITHUB_ORG}/MaiDroid`,
  droidReleases: `${GITHUB_ORG}/MaiDroid/releases`,

  // 本站仓库：404 页“报告问题”和衍生项目里的官网卡片
  siteRepo: `${GITHUB_ORG}/MaiWeb`,
  siteIssues: `${GITHUB_ORG}/MaiWeb/issues`,
} as const;

// 首屏下载与版本号在浏览器端实时查询的 GitHub Releases 接口
export const releaseApis = {
  core: 'https://api.github.com/repos/Mai-with-u/MaiBot/releases/latest',
  oneKey: 'https://api.github.com/repos/Mai-with-u/MaiBotOneKey/releases/latest',
  droid: 'https://api.github.com/repos/Mai-with-u/MaiDroid/releases?per_page=10',
} as const;
