import assert from 'node:assert/strict';
import test from 'node:test';
import { downloadCnbLatest, resolveCnbInstaller } from '../src/lib/cnb-download.ts';
import worker from '../src/worker.ts';

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

test('selects CNB latestTag and the standard installer, ignoring release and asset ordering', () => {
  assert.equal(
    resolveCnbInstaller(manifest()),
    'https://cnb.cool/Mai-with-u/MaiBotOneKey/-/releases/download/0.7.3/MaiBot-OK-0.7.3-win.exe'
  );
  assert.match(resolveCnbInstaller(manifest('0.8.0')), /\/0\.8\.0\/MaiBot-OK-0\.8\.0-win\.exe$/);
});

test('does not fall back to an older release or accept a malformed manifest', () => {
  for (const value of [null, {}, { ...manifest(), latestTag: '0.9.0' }, { ...manifest(), latestTag: '../bad' }]) {
    assert.throws(() => resolveCnbInstaller(value));
  }
  const value = manifest();
  value.releases[1].assets = [{ name: '../bad.exe', size: 1 }];
  assert.throws(() => resolveCnbInstaller(value));
  value.releases[1].assets = [
    { name: 'first.exe', size: 1 },
    { name: 'second.exe', size: 1 },
  ];
  assert.throws(() => resolveCnbInstaller(value));
});

test('redirects without caching and refreshes the upstream manifest on each request', async () => {
  let calls = 0;
  const fetcher = async (url, options) => {
    assert.equal(String(url), 'https://cnb.cool/Mai-with-u/MaiBotOneKey/-/git/raw/cnb-updates/latest.json');
    assert.equal(options?.cache, 'no-store');
    assert.ok(options?.signal);
    return Response.json(manifest(++calls === 1 ? '0.7.3' : '0.8.0'));
  };
  for (const tag of ['0.7.3', '0.8.0']) {
    const response = await downloadCnbLatest(new Request('https://maibot.chat/downloads/onekey/cnb'), fetcher);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.ok(response.headers.get('Location')?.includes(`/${tag}/`));
  }
});

test('upstream failures give a usable error instead of a guessed download link', async () => {
  for (const fetcher of [
    async () => new Response('', { status: 503 }),
    async () => new Response('invalid JSON'),
    async () => {
      throw new Error('timeout');
    },
  ]) {
    const response = await downloadCnbLatest(new Request('https://maibot.chat/downloads/onekey/cnb'), fetcher);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Location'), null);
    assert.match(await response.text(), /GitHub/);
  }
});

test('HEAD redirects without a body; unsupported methods never call upstream', async () => {
  const response = await downloadCnbLatest(
    new Request('https://maibot.chat/downloads/onekey/cnb', { method: 'HEAD' }),
    async () => Response.json(manifest())
  );
  assert.equal(response.status, 302);
  assert.equal(await response.text(), '');
  const rejected = await downloadCnbLatest(
    new Request('https://maibot.chat/downloads/onekey/cnb', { method: 'POST' }),
    async () => {
      throw new Error('must not be called');
    }
  );
  assert.equal(rejected.status, 405);
});

test('ordinary pages continue through the existing static assets binding', async () => {
  const request = new Request('https://maibot.chat/en/projects/');
  const response = await worker.fetch(request, {
    ASSETS: {
      fetch: async (value) => {
        assert.equal(value, request);
        return new Response('static page');
      },
    },
  });
  assert.equal(await response.text(), 'static page');
});
