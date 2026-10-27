import { CNB_DOWNLOAD_PATH, downloadCnbLatest } from './lib/cnb-download.ts';

interface Env {
  ASSETS: { fetch: (_request: Request) => Promise<Response> };
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname.replace(/\/$/, '');
    if (pathname === CNB_DOWNLOAD_PATH) return downloadCnbLatest(request);
    return env.ASSETS.fetch(request);
  },
};
