import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDownloadPlatform } from '../src/lib/download-platform.ts';

test('PC recommends the Windows installer, including touch-screen PCs', () => {
  assert.equal(getDownloadPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 10), 'windows');
});

test('Android phones and tablets recommend the APK', () => {
  assert.equal(getDownloadPlatform('Mozilla/5.0 (Linux; Android 15) Mobile', 5), 'android');
  assert.equal(getDownloadPlatform('Mozilla/5.0 (Linux; Android 15)', 5), 'android');
});

test('iPhone and iPad offer deployment options instead of an EXE', () => {
  assert.equal(getDownloadPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5), 'deployment');
  assert.equal(getDownloadPlatform('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)', 5), 'deployment');
  assert.equal(getDownloadPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1.15', 5), 'deployment');
});

test('desktop Mac UA is not confused with an iPad', () => {
  assert.equal(getDownloadPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 0), 'windows');
});
