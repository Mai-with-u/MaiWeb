export const CNB_DOWNLOAD_PATH = '/downloads/onekey/cnb';
const CNB_REPOSITORY = 'https://cnb.cool/Mai-with-u/MaiBotOneKey';
const MANIFEST_URL = `${CNB_REPOSITORY}/-/git/raw/cnb-updates/latest.json`;

type JsonObject = Record<string, unknown>;
const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null;

// Use CNB's own published manifest: a newer GitHub release may not be mirrored yet.
export function resolveCnbInstaller(value: unknown): string {
  if (!isObject(value) || value.schema !== 1 || typeof value.latestTag !== 'string' || !Array.isArray(value.releases)) {
    throw new Error('Invalid CNB manifest');
  }
  const tag = value.latestTag;
  if (!/^v?\d+\.\d+\.\d+$/.test(tag)) throw new Error('Invalid release tag');
  const release = value.releases.find((item) => isObject(item) && item.tag_name === tag);
  if (!isObject(release) || !Array.isArray(release.assets)) throw new Error('Missing latest release');

  const assets = release.assets.filter(
    (asset): asset is JsonObject & { name: string } =>
      isObject(asset) &&
      typeof asset.name === 'string' &&
      /^[\w .-]+\.exe$/i.test(asset.name) &&
      typeof asset.size === 'number' &&
      asset.size > 0
  );
  const canonical = `MaiBot-OK-${tag.replace(/^v/, '')}-win.exe`;
  const asset = assets.find((item) => item.name === canonical) ?? (assets.length === 1 ? assets[0] : undefined);
  if (!asset) throw new Error('Missing or ambiguous Windows installer');

  // Construct the destination from a fixed official repository; never trust a manifest-supplied URL.
  return `${CNB_REPOSITORY}/-/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(asset.name)}`;
}

export async function downloadCnbLatest(request: Request, fetcher: typeof fetch = fetch): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } });
  }
  try {
    const response = await fetcher(MANIFEST_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('CNB manifest unavailable');
    const location = resolveCnbInstaller(await response.json());
    return new Response(null, { status: 302, headers: { ...headers, Location: location } });
  } catch {
    return new Response(
      request.method === 'HEAD'
        ? null
        : 'CNB 下载暂时不可用，请返回官网选择 GitHub 源。\nCNB is temporarily unavailable. Please return to MaiBot and choose GitHub.',
      { status: 503, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
}
