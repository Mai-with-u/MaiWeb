export type DownloadPlatform = 'windows' | 'android' | 'deployment';

export function getDownloadPlatform(userAgent: string, maxTouchPoints = 0): DownloadPlatform {
  if (/Android/i.test(userAgent)) return 'android';
  // iPadOS 的桌面模式使用 Macintosh UA，通过多点触控与 Mac 区分。
  if (/iPhone|iPad|iPod|Mobile/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) {
    return 'deployment';
  }
  return 'windows';
}
