import { IntlMessageFormat } from 'intl-messageformat';

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
    en: {
        locale: 'en',
        htmlLang: 'en',
        languageName: 'English',
        app: {
            title: 'MathJSLab Calc',
            description: 'Scientific prompt calculator',
        },
        shell: {
            languageLabel: 'Language',
            toggleKeypad: 'Toggle keypad',
            useAppKeypad: 'Use app keypad',
            useNativeKeyboard: 'Use native keyboard',
        },
        prompt: {
            ariaLabel: 'MathJSLab prompt',
            listAriaLabel: 'MathJSLab prompt list',
        },
        keypad: {
            ariaLabel: 'Scientific keypad',
            panelLabel: 'Keypad panels',
            title: 'Scientific',
            brand: 'MathJSLab',
            panels: {
                calculator: 'Calculator',
                functions: 'Functions',
                alphabet: 'Alphabet',
            },
            keys: {
                enter: 'Enter',
                delete: 'DEL',
                clear: 'AC',
            },
        },
    },
    es: {
        locale: 'es',
        htmlLang: 'es',
        languageName: 'Español',
        app: {
            title: 'MathJSLab Calc',
            description: 'Calculadora científica con prompt',
        },
        shell: {
            languageLabel: 'Idioma',
            toggleKeypad: 'Mostrar u ocultar teclado',
            useAppKeypad: 'Usar teclado de la app',
            useNativeKeyboard: 'Usar teclado nativo',
        },
        prompt: {
            ariaLabel: 'Prompt de MathJSLab',
            listAriaLabel: 'Lista de prompts de MathJSLab',
        },
        keypad: {
            ariaLabel: 'Teclado científico',
            panelLabel: 'Paneles del teclado',
            title: 'Científica',
            brand: 'MathJSLab',
            panels: {
                calculator: 'Calculadora',
                functions: 'Funciones',
                alphabet: 'Alfabético',
            },
            keys: {
                enter: 'Intro',
                delete: 'DEL',
                clear: 'AC',
            },
        },
    },
    pt: {
        locale: 'pt',
        htmlLang: 'pt-BR',
        languageName: 'Português',
        app: {
            title: 'MathJSLab Calc',
            description: 'Calculadora científica com prompt',
        },
        shell: {
            languageLabel: 'Idioma',
            toggleKeypad: 'Mostrar ou ocultar teclado',
            useAppKeypad: 'Usar teclado do aplicativo',
            useNativeKeyboard: 'Usar teclado nativo',
        },
        prompt: {
            ariaLabel: 'Prompt do MathJSLab',
            listAriaLabel: 'Lista de prompts do MathJSLab',
        },
        keypad: {
            ariaLabel: 'Teclado científico',
            panelLabel: 'Painéis do teclado',
            title: 'Científica',
            brand: 'MathJSLab',
            panels: {
                calculator: 'Calculadora',
                functions: 'Funções',
                alphabet: 'Alfabético',
            },
            keys: {
                enter: 'Enter',
                delete: 'DEL',
                clear: 'AC',
            },
        },
    },
} as const;

const locales = Object.keys(source) as Locale[];
const localeStorageKey = 'mathjslab-calc:i18n:locale';

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
 * Format static ICU messages recursively for direct component consumption.
 */
const formatValue = (value: MessageTree, locale: Locale): any => {
    if (typeof value === 'string') {
        return new IntlMessageFormat(value, locale).format();
    }

    if (Array.isArray(value)) {
        return value.map((entry) => formatValue(entry, locale));
    }

    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, formatValue(entry, locale)]));
};

const pages = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, formatValue(values, locale as Locale)])) as Record<Locale, any>;

/**
 * Pick the startup locale from URL, persisted selection, then browser settings.
 */
const getInitialLocale = (): Locale => {
    const params = new URLSearchParams(globalThis.location.search);
    return firstSupportedLocale([params.get('lang'), globalThis.localStorage.getItem(localeStorageKey), ...globalThis.navigator.languages, globalThis.navigator.language]) ?? 'en';
};

/**
 * Shared locale coordinator for document metadata and Web Components.
 */
class I18n extends EventTarget {
    public readonly defaultLocale: Locale = 'en';
    public readonly locales = locales;
    public readonly languageNames = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, values.languageName])) as Record<Locale, string>;
    public readonly pages = pages;
    private currentLocale: Locale = getInitialLocale();

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
        if (nextLocale === this.currentLocale) {
            return;
        }
        this.currentLocale = nextLocale;
        globalThis.localStorage.setItem(localeStorageKey, nextLocale);
        this.applyDocumentLanguage();
        this.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: nextLocale } }));
    }

    /**
     * Apply localized metadata to the host document.
     */
    public applyDocumentLanguage(): void {
        document.documentElement.lang = this.page.htmlLang;
        document.title = this.page.app.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', this.page.app.description);
    }
}

const i18n = new I18n();

export { type Locale, i18n };
export default i18n;
