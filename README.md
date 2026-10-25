# MaiWeb

麦麦（MaiBot / MaiSaka）的官方网站，基于 [Astro](https://astro.build/) 构建的纯静态站点，部署在 Cloudflare。

## 开发

需要 Node.js 22.12 及以上。

```bash
npm install
npm run dev        # 本地开发，默认 http://localhost:4321
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

提交前请确保下面几项都通过（CI 会在 master / dev 的推送与 PR 上执行同样的检查）：

```bash
npm run check          # astro check 类型检查
npm run lint           # ESLint
npm run format:check   # Prettier 格式检查，可用 npm run format 自动修复
npm run build
```

## 目录结构

```text
src/
├─ data/          # 站点数据：外部链接、QQ 群与社交平台、衍生项目卡片
├─ lib/github.ts  # 构建时拉取 GitHub 社区统计与贡献者，失败时退回快照
├─ components/    # 按钮、原生 dialog 弹窗、布局辅助组件
├─ sections/      # 页面区块：导航、首屏、特性区、页脚等
├─ pages/         # 路由：首页、衍生项目、关于我们、404
└─ styles/        # 全局设计 token 与基础样式
```

- 文档站路径、仓库地址变化时，改 `src/data/links.ts`。
- QQ 群变化时，改 `src/data/community.ts`，与文档站“交流群”页面保持一致。
- 衍生项目的增删和排序，改 `src/data/projects.ts`。

## 配置

- **正式域名**：`astro.config.mjs` 中的 `site` 字段，canonical、OpenGraph 链接都从这里生成。
- **GITHUB_TOKEN（可选）**：构建时请求 GitHub 统计接口用的令牌。不配置也能构建，但未登录请求每小时只有 60 次额度，被限流时页面会显示内置的快照数字。

## 响应式约定

布局全部由 CSS 决定，不依赖运行时脚本：

- **宽屏等比缩放**：宽度 >= 1024px 且宽高比 >= 5:4 时，根字号为 `16px × min(视口宽/1600, 视口高/900)`（限制在 12px~25.6px），
  页面按 1600×900 设计稿整体等比缩放。组件尺寸一律写 `rem`（设计稿 px ÷ 16），宽屏两栏规则统一使用
  `@media (min-width: 1024px) and (min-aspect-ratio: 5/4)`。2px 以内的细线和触屏点击尺寸保持 `px`。
- **单栏流式布局**：手机、竖屏平板、横屏手机保持 16px 根字号，字号间距用 `clamp()` 流式变化；首屏只显示文案并垂直居中，不显示立绘和特性区演示屏。
- `768px`：导航栏在汉堡菜单和完整菜单之间切换。

## 许可

GPL-3.0，详见 [LICENSE.txt](LICENSE.txt)。
