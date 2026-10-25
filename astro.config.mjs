// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 站点正式域名：canonical、OpenGraph 图片和分享链接都从这里拼出来，换域名时只改这一处
  site: 'https://mai-mai.org',
});
