// @ts-check
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 站点正式域名：canonical、OpenGraph 图片和分享链接都从这里拼出来，换域名时只改这一处
  site: 'https://mai-mai.org',
  vite: {
    // 固定使用本仓库的 tsconfig。Vite 8 默认按文件逐级向上查找 tsconfig，node_modules 里的文件不在本仓库
    // include 范围内，会继续往上找；仓库检出在另一个项目目录里面（例如 .claude/worktrees 下的工作树）时，
    // 就会读到外层项目的 tsconfig，而外层没有安装依赖，会报 "Tsconfig not found astro/tsconfigs/strict"。
    // 构建走 tsconfig（相对项目根目录），astro dev 启动时的依赖预扫描走 optimizeDeps.rolldownOptions
    // （相对命令的工作目录，即在仓库根目录执行 npm run dev），两处都要指定。
    tsconfig: './tsconfig.json',
    build: {
      // CSS 的目标浏览器，取值与 Vite 8 默认的 baseline-widely-available 一致。Astro 把构建目标设成 esnext，
      // Lightning CSS 压缩时就不补前缀，还会把同一属性的标准写法和 -webkit- 写法合并成一条，
      // 导致毛玻璃在 Chrome/Firefox 或旧版 Safari 上失效；指定目标后由它按需输出 -webkit-backdrop-filter 等前缀。
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
    },
    optimizeDeps: {
      rolldownOptions: { tsconfig: './tsconfig.json' },
    },
  },
  env: {
    schema: {
      // 可选：构建时请求 GitHub 统计接口用的令牌，不配置也能构建，只是更容易被限流而退回快照数据
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
