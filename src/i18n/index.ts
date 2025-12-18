import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import ja from './locales/ja.json';

// Supported locales
export const supportedLocales = ['ja'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

// Type guard for supported locale
function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

// Create i18n instance
const i18n = new I18n({
  ja,
});

// Set default locale
i18n.defaultLocale = 'ja';

// Get device locale with type-safe fallback
const deviceLocale = Localization.getLocales()[0]?.languageCode;
i18n.locale = deviceLocale && isSupportedLocale(deviceLocale) ? deviceLocale : 'ja';

// Enable fallbacks
i18n.enableFallback = true;

export default i18n;

// Helper function to translate with interpolation
export const t = (
  key: string,
  options?: Record<string, string | number>
): string => {
  return i18n.t(key, options);
};

// Helper function to change locale
export const setLocale = (locale: SupportedLocale): void => {
  i18n.locale = locale;
};

// Helper function to get current locale
export const getLocale = (): string => {
  return i18n.locale;
};
