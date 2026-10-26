import { en } from '../data/en';

export type Locale = 'zh-CN' | 'en';

export function getLocale(url: URL): Locale {
  return /^\/en(?:\/|$)/.test(url.pathname) ? 'en' : 'zh-CN';
}

export function localePath(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const path = href.replace(/^\/en(?=\/|$)/, '') || '/';
  return locale === 'en' ? `/en${path}` : path;
}

// Chinese copy is the source key. Normalize layout whitespace without altering Chinese output.
export function translator(locale: Locale) {
  return (text: string): string => (locale === 'en' ? (en[text.trim().replace(/\s+/g, ' ')] ?? text) : text);
}

export function useI18n(url: URL) {
  const locale = getLocale(url);
  return { locale, t: translator(locale), localPath: (href: string) => localePath(href, locale) };
}
