import i18n, { type Locale } from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import styles from './language-switcher.styles.scss';

/**
 * Elements addressed inside the language switcher shadow tree.
 */
export interface LanguageSwitcherElementEntry {
    wrapper: HTMLElement;
    toggle: HTMLButtonElement;
    icon: HTMLImageElement;
    label: HTMLSpanElement;
    menu: HTMLUListElement;
}

export type LanguageSwitcherElement = WebComponentElement<LanguageSwitcherElementEntry>;
export const LanguageSwitcherElementEntryKey: (keyof LanguageSwitcherElementEntry)[] = ['wrapper', 'toggle', 'icon', 'label', 'menu'] as const;

export type LanguageSwitcherSelectDetail = {
    locale: string;
    href: string;
};

export type LanguageSwitcherSelectEvent = CustomEvent<LanguageSwitcherSelectDetail>;

/**
 * Link-based responsive language selector shared by MathJSLab applications.
 */
export class LanguageSwitcher extends HTMLElement {
    public static readonly tagName = 'language-switcher';
    public readonly element = {} as LanguageSwitcherElement;
    public static readonly elementFields: (keyof LanguageSwitcherElementEntry)[] = LanguageSwitcherElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(LanguageSwitcherElementEntryKey);
    public static readonly null = null as unknown as LanguageSwitcher;
    public static readonly undefined = undefined as unknown as LanguageSwitcher;
    public static readonly observedAttributes = ['base-path', 'button-label', 'href-template', 'icon-src', 'locale', 'menu-label', 'path-suffix'];
    private readonly mobileBreakpoint = 900;

    public constructor() {
        super();
        constructorFactory(LanguageSwitcher, styles).bind(this)();
    }

    public set superId(id: string) {
        super.id = id;
    }

    public get superId(): string {
        return super.id;
    }

    public set id(id: string) {
        this.setId(id);
    }

    public get id(): string {
        return super.id;
    }

    public setId: (this: LanguageSwitcher, id?: string) => void = setIdFirstFactory(LanguageSwitcher).bind(this);
    public static readonly createElement = createElementFactory(LanguageSwitcher);
    public static readonly define = defineFactory(LanguageSwitcher);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        this.element.toggle.addEventListener('click', this.toggleMenu);
        this.element.menu.addEventListener('click', this.selectLanguage);
        document.addEventListener('click', this.closeFromDocument);
        globalThis.addEventListener('resize', this.closeFromResize);
        i18n.addEventListener('languagechange', this.setLanguage);
        this.setLanguage();
    }

    public disconnectedCallback(): void {
        this.element.toggle.removeEventListener('click', this.toggleMenu);
        this.element.menu.removeEventListener('click', this.selectLanguage);
        document.removeEventListener('click', this.closeFromDocument);
        globalThis.removeEventListener('resize', this.closeFromResize);
        i18n.removeEventListener('languagechange', this.setLanguage);
    }

    public attributeChangedCallback(): void {
        if (this.isConnected) {
            this.setLanguage();
        }
    }

    /**
     * Re-render labels, links, and current-language state.
     */
    public readonly setLanguage = (): void => {
        const locale = this.locale;
        this.element.wrapper.setAttribute('aria-label', this.menuLabel);
        this.element.toggle.setAttribute('aria-label', this.menuLabel);
        this.element.toggle.setAttribute('aria-controls', this.element.menu.id);
        this.element.toggle.title = this.menuLabel;
        this.element.icon.src = this.iconSrc;
        this.element.label.textContent = this.currentLanguageName;
        this.element.menu.setAttribute('aria-label', this.menuLabel);
        const sourceLinks = [...this.querySelectorAll<HTMLAnchorElement>('a[data-locale]')];
        const links =
            sourceLinks.length > 0
                ? sourceLinks
                : i18n.locales.map((entry) => {
                      const link = document.createElement('a');
                      link.href = this.hrefFor(entry);
                      link.dataset.locale = entry;
                      link.textContent = i18n.languageNames[entry];
                      return link;
                  });
        this.element.menu.replaceChildren(
            ...links
                .filter((sourceLink) => sourceLink.dataset.locale !== locale)
                .map((sourceLink) => {
                    const entry = sourceLink.dataset.locale || '';
                    const link = sourceLink.cloneNode(true) as HTMLAnchorElement;
                    const item = document.createElement('li');
                    link.href = sourceLink.href || this.hrefFor(entry);
                    link.removeAttribute('aria-current');
                    item.append(link);
                    return item;
                }),
        );
    };

    private get locale(): Locale {
        const locale = this.getAttribute('locale');
        return i18n.locales.includes(locale as Locale) ? (locale as Locale) : i18n.locale;
    }

    private get buttonLabel(): string {
        return this.getAttribute('button-label') || i18n.page.language?.menu || 'Language';
    }

    private get currentLanguageName(): string {
        return i18n.languageNames[this.locale] || this.buttonLabel;
    }

    private get menuLabel(): string {
        return this.getAttribute('menu-label') || i18n.page.language?.label || this.buttonLabel;
    }

    private get iconSrc(): string {
        return this.getAttribute('icon-src') || '/images/language-switch.svg';
    }

    private hrefFor(locale: string): string {
        const template = this.getAttribute('href-template');
        if (template) {
            return template.replaceAll('{locale}', locale);
        }
        const basePath = this.getAttribute('base-path') || '/';
        const pathSuffix = this.getAttribute('path-suffix') || '';
        const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
        const suffix = pathSuffix.replace(/^\/+/, '');
        return `${base}${locale}/${suffix}`;
    }

    private readonly toggleMenu = (): void => {
        const shouldOpen = this.element.toggle.getAttribute('aria-expanded') !== 'true';
        this.element.toggle.setAttribute('aria-expanded', String(shouldOpen));
        this.element.menu.toggleAttribute('data-open', shouldOpen);
    };

    private readonly selectLanguage = (event: MouseEvent): void => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-locale]');
        if (!link) {
            return;
        }
        const selectionEvent = new CustomEvent<LanguageSwitcherSelectDetail>('language-switcher-select', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                locale: link.dataset.locale || '',
                href: link.href,
            },
        });
        if (!this.dispatchEvent(selectionEvent)) {
            event.preventDefault();
        }
        this.closeMenu();
    };

    private readonly closeFromDocument = (event: MouseEvent): void => {
        if (event.composedPath().includes(this)) {
            return;
        }
        this.closeMenu();
    };

    private readonly closeFromResize = (): void => {
        this.closeMenu();
    };

    private closeMenu(): void {
        this.element.toggle.setAttribute('aria-expanded', 'false');
        this.element.menu.removeAttribute('data-open');
    }
}

LanguageSwitcher.define();
