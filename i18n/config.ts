export const defaultLocale = 'ar' as const;
export const locales = ['ar', 'en'] as const;

export const localeCookieName = 'RAWNAK_LOCALE';

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
