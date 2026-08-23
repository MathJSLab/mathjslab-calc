import { IntlMessageFormat } from 'intl-messageformat';
import en from '../data/i18n-en';
import es from '../data/i18n-es';
import pt from '../data/i18n-pt';

/**
 * Supported application locale identifiers.
 */
type Locale = 'en' | 'es' | 'pt';

/**
 * Recursive source message shape used before ICU formatting.
 */
type MessageTree = string | MessageTree[] | { [key: string]: MessageTree };

/**
 * Locale source messages rendered by the calculator shell and its components.
 */
const source = {
    en,
    es,
    pt,
} as const;

const locales = Object.keys(source) as Locale[];
const localeStorageKey = 'mathjslab-calc:i18n:locale';
const isBrowser = typeof window !== 'undefined';

/**
 * Normalize a language tag to one of the supported application locales.
 */
const normalizeLocale = (locale?: string | null): Locale => {
    const language = locale?.toLowerCase().split('-')[0] as Locale | undefined;
    return language && locales.includes(language) ? language : 'en';
};

/**
 * Return the first supported language from a prioritized list of candidates.
 */
const firstSupportedLocale = (locales: Iterable<string | null | undefined>): Locale | undefined => {
    for (const locale of locales) {
        const language = locale?.toLowerCase().split('-')[0] as Locale | undefined;
        if (language && source[language]) {
            return language;
        }
    }
    return undefined;
};

/**
 * Build the public endpoint path for one supported locale.
 */
const localePath = (locale: Locale): string => `/${locale}/`;

/**
 * Check whether the current document is the root endpoint.
 */
const isRootPath = (pathname: string): boolean => pathname === '/' || pathname === '/index.html';

/**
 * Format static ICU messages recursively for direct component consumption.
 */
const formatValue = (value: MessageTree, locale: Locale, key = ''): any => {
    if (typeof value === 'string') {
        if (key.endsWith('Html') || key.endsWith('MathML')) {
            return value;
        }
        return new IntlMessageFormat(value, locale).format();
    }

    if (Array.isArray(value)) {
        return value.map((entry) => formatValue(entry, locale, key));
    }

    return Object.fromEntries(Object.entries(value).map(([entryKey, entry]) => [entryKey, formatValue(entry, locale, entryKey)]));
};

const pages = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, formatValue(values, locale as Locale)])) as Record<Locale, any>;
const languageNames = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, values.languageName])) as Record<Locale, string>;

/**
 * Static locale data shared by browser runtime and Eleventy templates.
 */
const i18nData = {
    defaultLocale: 'en' as Locale,
    locales,
    languageNames,
    pages,
};

/**
 * Pick the startup locale from URL, path, browser settings, then persisted selection.
 */
const getInitialLocale = (): Locale => {
    const location = globalThis.location;
    const navigator = globalThis.navigator;
    const params = new URLSearchParams(location?.search || '');
    const pathLocale = location?.pathname.split('/').find(Boolean);
    const storedLocale = isBrowser ? globalThis.localStorage?.getItem(localeStorageKey) : null;
    return firstSupportedLocale([params.get('lang'), pathLocale, ...(navigator?.languages || []), navigator?.language, storedLocale]) ?? 'en';
};

/**
 * Shared locale coordinator for document metadata and Web Components.
 */
class I18n extends EventTarget {
    public readonly defaultLocale: Locale = i18nData.defaultLocale;
    public readonly locales = i18nData.locales;
    public readonly languageNames = i18nData.languageNames;
    public readonly pages = pages;
    private currentLocale: Locale = getInitialLocale();

    public constructor() {
        super();
        this.redirectRootEndpoint();
    }

    public get locale(): Locale {
        return this.currentLocale;
    }

    public get page(): any {
        return this.pages[this.currentLocale];
    }

    /**
     * Change and persist the active locale.
     */
    public setLocale(locale?: string | null): void {
        const nextLocale = normalizeLocale(locale);
        if (isBrowser) {
            globalThis.localStorage?.setItem(localeStorageKey, nextLocale);
            if (this.navigateToLocaleEndpoint(nextLocale)) {
                return;
            }
        }
        if (nextLocale === this.currentLocale) {
            return;
        }
        this.currentLocale = nextLocale;
        this.applyDocumentLanguage();
        this.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: nextLocale } }));
    }

    /**
     * Apply localized metadata to the host document.
     */
    public applyDocumentLanguage(): void {
        if (typeof document === 'undefined') {
            return;
        }
        document.documentElement.lang = this.page.htmlLang;
        document.title = this.page.app.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', this.page.app.description);
    }

    /**
     * Redirect the root app endpoint to the locale-specific endpoint selected
     * from URL parameters or browser preferences.
     */
    private redirectRootEndpoint(): void {
        if (!isBrowser || !isRootPath(globalThis.location.pathname)) {
            return;
        }
        this.navigateToLocaleEndpoint(this.currentLocale, true);
    }

    /**
     * Navigate to the canonical endpoint for a locale when needed.
     */
    private navigateToLocaleEndpoint(locale: Locale, replace = false): boolean {
        const targetPath = localePath(locale);
        if (!isBrowser || globalThis.location.pathname === targetPath) {
            return false;
        }

        const nextUrl = new URL(globalThis.location.href);
        nextUrl.pathname = targetPath;
        if (replace) {
            globalThis.location.replace(nextUrl.href);
        } else {
            globalThis.location.assign(nextUrl.href);
        }
        return true;
    }
}

const i18n = new I18n();

export { type Locale, i18n, i18nData };
export default i18n;
