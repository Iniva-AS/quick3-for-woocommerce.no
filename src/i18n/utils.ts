import noTranslations from './locales/no.json';
import enTranslations from './locales/en.json';

const translations = {
	no: noTranslations,
	en: enTranslations,
};

export type Locale = 'no' | 'en';

export function getTranslations(locale: Locale) {
	return translations[locale] || translations.no;
}

export function useTranslations(locale: string) {
	const validLocale = (locale === 'en' ? 'en' : 'no') as Locale;
	const t = getTranslations(validLocale);
	return t;
}

export const defaultLocale: Locale = 'no';
export const locales = ['no', 'en'] as const;

export function getLocalizedPath(locale: Locale, path: string): string {
	return `/${locale}${path}`;
}

export function getAlternateLocale(currentLocale: Locale): Locale {
	return currentLocale === 'no' ? 'en' : 'no';
}
