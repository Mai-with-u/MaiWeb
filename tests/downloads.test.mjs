import assert from 'node:assert/strict';
import test from 'node:test';
import { handleDownloads, readCnbManifest, readGitHubRelease } from '../src/lib/downloads.ts';
import worker from '../src/worker.ts';

const CNB_ONEKEY = 'https://cnb.cool/Mai-with-u/MaiBotOneKey/-/git/raw/cnb-updates/latest.json';
const CNB_DROID = 'https://cnb.cool/Mai-with-u/MaiDroid/-/git/raw/cnb-updates/latest.json';
const GH_ONEKEY = 'https://api.github.com/repos/Mai-with-u/MaiBotOneKey/releases/latest';
const GH_DROID = 'https://api.github.com/repos/Mai-with-u/MaiDroid/releases/latest';

const manifest = (tag = '0.7.3') => ({
  schema: 1,
  latestTag: tag,
  releases: [
    { tag_name: '0.7.0', assets: [{ name: 'old.exe', size: 100 }] },
    {
      tag_name: tag,
      assets: [
        { name: 'latest.yml', size: 100 },
        { name: `MaiBot-OK-${tag}-win-snowluma.exe`, size: 100 },
        { name: `MaiBot-OK-${tag}-win.exe`, size: 100 },
      ],
    },
  ],
});

const droidManifest = (tag = 'v0.1.3') => ({
  schema: 1,
  latestTag: tag,
  releases: [{ tag_name: tag, assets: [{ name: `MaiDroid_${tag}.apk`, size: 100 }] }],
});

const githubRelease = (tag, names) => ({
  tag_name: tag,
  draft: false,
  assets: names.map((name) => ({
    name,
    size: 100,
    state: 'uploaded',
    browser_download_url: `https://evil.example/${name}`,
  })),
});

// 按地址返回模拟的上游响应，并记录被请求过的地址；没列出的地址一律当作网络失败
function upstream(routes) {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url: String(url), options });
    const route = routes[String(url)];
    if (!route) throw new Error('offline');
    return typeof route === 'function' ? route() : Response.json(route);
  };
  return { calls, fetcher };
}

const request = (path, method = 'GET') => new Request(`https://maibot.chat${path}`, { method });

test('CNB manifest picks latestTag and the standard installer, ignoring release and asset ordering', () => {
  assert.equal(
    readCnbManifest('onekey', manifest()).url,
    'https://cnb.cool/Mai-with-u/MaiBotOneKey/-/releases/download/0.7.3/MaiBot-OK-0.7.3-win.exe'
  );
  assert.match(readCnbManifest('onekey', manifest('0.8.0')).url, /\/0\.8\.0\/MaiBot-OK-0\.8\.0-win\.exe$/);
  assert.deepEqual(readCnbManifest('maidroid', droidManifest()), {
    version: 'v0.1.3',
    source: 'cnb',
    url: 'https://cnb.cool/Mai-with-u/MaiDroid/-/releases/download/v0.1.3/MaiDroid_v0.1.3.apk',
  });
});

test('does not fall back to an older release or accept a malformed manifest', () => {
  for (const value of [null, {}, { ...manifest(), latestTag: '0.9.0' }, { ...manifest(), latestTag: '../bad' }]) {
    assert.throws(() => readCnbManifest('onekey', value));
  }
  const value = manifest();
  value.releases[1].assets = [{ name: '../bad.exe', size: 1 }];
  assert.throws(() => readCnbManifest('onekey', value));
  value.releases[1].assets = [
    { name: 'first.exe', size: 1 },
    { name: 'second.exe', size: 1 },
  ];
  assert.throws(() => readCnbManifest('onekey', value));
  // Android 不能把 Windows 安装包或调试包当成 APK 交出去
  assert.throws(() => readCnbManifest('onekey', droidManifest()));
  const debugOnly = droidManifest();
  debugOnly.releases[0].assets = [{ name: 'MaiDroid_v0.1.3-debug.apk', size: 1 }];
  assert.throws(() => readCnbManifest('maidroid', debugOnly));
});

test('GitHub downloads are built from the fixed repository, never from the API-supplied URL', () => {
  assert.deepEqual(readGitHubRelease('onekey', githubRelease('0.7.4', ['latest.yml', 'MaiBot-OK-0.7.4-win.exe'])), {
    version: '0.7.4',
    source: 'github',
    url: 'https://github.com/Mai-with-u/MaiBotOneKey/releases/download/0.7.4/MaiBot-OK-0.7.4-win.exe',
  });
  assert.equal(
    readGitHubRelease('maidroid', githubRelease('v0.1.3', ['MaiDroid_v0.1.3.apk', 'MaiDroid_v0.1.3-debug.apk'])).url,
    'https://github.com/Mai-with-u/MaiDroid/releases/download/v0.1.3/MaiDroid_v0.1.3.apk'
  );
  // 附件还没传完的版本不能当成可下载
  const uploading = githubRelease('0.7.4', ['MaiBot-OK-0.7.4-win.exe']);
  uploading.assets[0].state = 'starter';
  assert.throws(() => readGitHubRelease('onekey', uploading));
  assert.throws(() => readGitHubRelease('onekey', { ...githubRelease('0.7.4', ['a.exe']), draft: true }));
});

test('mainland China visitors go to CNB first, without asking GitHub', async () => {
  const { calls, fetcher } = upstream({ [CNB_ONEKEY]: manifest(), [CNB_DROID]: droidManifest() });
  const windows = await handleDownloads(request('/downloads/onekey'), { country: 'CN', fetcher });
  assert.equal(windows.status, 302);
  assert.equal(windows.headers.get('Cache-Control'), 'no-store');
  assert.match(windows.headers.get('Location'), /^https:\/\/cnb\.cool\/.*\/MaiBot-OK-0\.7\.3-win\.exe$/);
  const android = await handleDownloads(request('/downloads/maidroid/'), { country: 'CN', fetcher });
  assert.match(android.headers.get('Location'), /^https:\/\/cnb\.cool\/Mai-with-u\/MaiDroid\/.*\.apk$/);
  assert.deepEqual(
    calls.map((call) => call.url),
    [CNB_ONEKEY, CNB_DROID]
  );
  assert.equal(calls[0].options.cache, 'no-store');
  assert.ok(calls[0].options.signal);
});

test('mainland China falls back to GitHub when CNB fails, then to the release page', async () => {
  const github = upstream({
    [CNB_ONEKEY]: () => new Response('', { status: 503 }),
    [GH_ONEKEY]: githubRelease('0.7.4', ['MaiBot-OK-0.7.4-win.exe']),
  });
  const viaGitHub = await handleDownloads(request('/downloads/onekey'), { country: 'CN', fetcher: github.fetcher });
  assert.match(viaGitHub.headers.get('Location'), /^https:\/\/github\.com\/.*\/0\.7\.4\/MaiBot-OK-0\.7\.4-win\.exe$/);

  const offline = upstream({});
  const page = await handleDownloads(request('/downloads/maidroid'), { country: 'CN', fetcher: offline.fetcher });
  assert.equal(page.status, 302);
  assert.equal(page.headers.get('Location'), 'https://github.com/Mai-with-u/MaiDroid/releases');
  assert.deepEqual(
    offline.calls.map((call) => call.url),
    [CNB_DROID, GH_DROID]
  );
});

test('other regions go straight to GitHub with a User-Agent and edge caching for successes only', async () => {
  const { calls, fetcher } = upstream({ [GH_ONEKEY]: githubRelease('0.7.4', ['MaiBot-OK-0.7.4-win.exe']) });
  for (const country of ['US', undefined, null]) {
    const response = await handleDownloads(request('/downloads/onekey'), { country, fetcher });
    assert.match(response.headers.get('Location'), /^https:\/\/github\.com\//);
  }
  assert.ok(calls.every((call) => call.url === GH_ONEKEY));
  assert.equal(calls[0].options.headers['User-Agent'], 'maibot.chat');
  assert.deepEqual(calls[0].options.cf.cacheTtlByStatus, { '200-299': 300, '300-599': -1 });

  const limited = upstream({ [GH_ONEKEY]: () => new Response('rate limited', { status: 403 }) });
  const page = await handleDownloads(request('/downloads/onekey'), { country: 'US', fetcher: limited.fetcher });
  assert.equal(page.headers.get('Location'), 'https://github.com/Mai-with-u/MaiBotOneKey/releases/latest');
});

test('an explicit source is honoured regardless of region', async () => {
  const { calls, fetcher } = upstream({
    [CNB_ONEKEY]: manifest(),
    [GH_ONEKEY]: githubRelease('0.7.4', ['MaiBot-OK-0.7.4-win.exe']),
  });
  const cnb = await handleDownloads(request('/downloads/onekey/cnb'), { country: 'US', fetcher });
  assert.match(cnb.headers.get('Location'), /^https:\/\/cnb\.cool\//);
  const github = await handleDownloads(request('/downloads/onekey/github/'), { country: 'CN', fetcher });
  assert.match(github.headers.get('Location'), /^https:\/\/github\.com\//);
  assert.deepEqual(
    calls.map((call) => call.url),
    [CNB_ONEKEY, GH_ONEKEY]
  );
});

test('an explicit CNB request that fails explains itself instead of switching source', async () => {
  for (const route of [
    () => new Response('', { status: 503 }),
    () => new Response('invalid JSON'),
    () => {
      throw new Error('timeout');
    },
  ]) {
    const { calls, fetcher } = upstream({ [CNB_ONEKEY]: route, [GH_ONEKEY]: githubRelease('0.7.4', ['a.exe']) });
    const response = await handleDownloads(request('/downloads/onekey/cnb'), { country: 'CN', fetcher });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Location'), null);
    assert.match(await response.text(), /GitHub/);
    assert.deepEqual(
      calls.map((call) => call.url),
      [CNB_ONEKEY]
    );
  }
});

test('latest.json reports the version each visitor would download', async () => {
  const { fetcher } = upstream({
    [CNB_ONEKEY]: manifest(),
    [GH_ONEKEY]: githubRelease('0.7.4', ['MaiBot-OK-0.7.4-win.exe']),
    [GH_DROID]: githubRelease('v0.1.3', ['MaiDroid_v0.1.3.apk']),
  });
  const china = await handleDownloads(request('/downloads/latest.json'), { country: 'CN', fetcher });
  assert.equal(china.headers.get('Cache-Control'), 'no-store');
  assert.match(china.headers.get('Content-Type'), /^application\/json/);
  assert.deepEqual(await china.json(), {
    onekey: { version: '0.7.3', source: 'cnb' },
    maidroid: { version: 'v0.1.3', source: 'github' },
  });
  const abroad = await handleDownloads(request('/downloads/latest.json'), { country: 'US', fetcher });
  assert.deepEqual(await abroad.json(), {
    onekey: { version: '0.7.4', source: 'github' },
    maidroid: { version: 'v0.1.3', source: 'github' },
  });
  const offline = await handleDownloads(request('/downloads/latest.json'), { fetcher: upstream({}).fetcher });
  assert.deepEqual(await offline.json(), { onekey: null, maidroid: null });
});

test('HEAD redirects without a body; unsupported methods never call upstream', async () => {
  const response = await handleDownloads(request('/downloads/onekey/cnb', 'HEAD'), {
    fetcher: upstream({ [CNB_ONEKEY]: manifest() }).fetcher,
  });
  assert.equal(response.status, 302);
  assert.equal(await response.text(), '');
  const rejected = await handleDownloads(request('/downloads/onekey', 'POST'), {
    fetcher: async () => {
      throw new Error('must not be called');
    },
  });
  assert.equal(rejected.status, 405);
  assert.equal(rejected.headers.get('Allow'), 'GET, HEAD');
});

test('other paths, including unknown download paths, continue through the static assets binding', async () => {
  for (const path of ['/en/projects/', '/downloads/unknown', '/downloads/onekey/other', '/en/downloads/onekey']) {
    assert.equal(handleDownloads(request(path)), undefined);
    const incoming = request(path);
    const response = await worker.fetch(incoming, {
      ASSETS: {
        fetch: async (value) => {
          assert.equal(value, incoming);
          return new Response('static page');
        },
      },
    });
    assert.equal(await response.text(), 'static page');
  }
});
