// @ts-check
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 站点正式域名：canonical、OpenGraph 图片和分享链接都从这里拼出来，换域名时只改这一处
  site: 'https://mai-mai.org',
  env: {
    schema: {
      // 可选：构建时请求 GitHub 统计接口用的令牌，不配置也能构建，只是更容易被限流而退回快照数据
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
