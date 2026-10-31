import { handleDownloads } from './lib/downloads.ts';

interface Env {
  ASSETS: { fetch: (_request: Request) => Promise<Response> };
}

// Cloudflare 会在请求上附带 cf.country（访客 IP 所在国家或地区的两位代码），下载入口按它选源
type CloudflareRequest = Request & { cf?: { country?: string | null } };

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    // 先看是不是 /downloads/ 下的下载入口，不是的话交给静态资源
    return (
      handleDownloads(request, { country: (request as CloudflareRequest).cf?.country }) ?? env.ASSETS.fetch(request)
    );
  },
};
