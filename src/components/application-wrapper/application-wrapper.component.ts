import styles from './application-wrapper.styles.scss';
import { appEngine } from '../../appEngine';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import type { AppearanceMode, AppearanceModeToggleEvent } from '../appearance-mode/appearance-mode.component';
import type { LanguageSwitcher, LanguageSwitcherSelectEvent } from '../language-switcher/language-switcher.component';

type Theme = 'dark' | 'light';

/**
 * Elements addressed inside the application wrapper shadow tree.
 */
export interface ApplicationWrapperElementEntry {
    root: HTMLElement;
    logo: HTMLImageElement;
    title: HTMLElement;
    description: HTMLElement;
    actions: HTMLElement;
    language: LanguageSwitcher;
    appearance: AppearanceMode;
    workspace: HTMLElement;
}

export type ApplicationWrapperElement = WebComponentElement<ApplicationWrapperElementEntry>;
export const ApplicationWrapperElementEntryKey: (keyof ApplicationWrapperElementEntry)[] = [
    'root',
    'logo',
    'title',
    'description',
    'actions',
    'language',
    'appearance',
    'workspace',
] as const;

/**
 * Shared outer application shell for MathJSLab Web applications.
 */
export class ApplicationWrapper extends HTMLElement {
    public static readonly tagName = 'application-wrapper';
    public readonly element = {} as ApplicationWrapperElement;
    public static readonly elementFields: (keyof ApplicationWrapperElementEntry)[] = ApplicationWrapperElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(ApplicationWrapperElementEntryKey);
    public static readonly null = null as unknown as ApplicationWrapper;
    public static readonly undefined = undefined as unknown as ApplicationWrapper;
    public static readonly observedAttributes = ['chrome', 'layout', 'logo-dark-src', 'logo-light-src', 'logo-src', 'storage-key'];
    private readonly colorScheme = globalThis.matchMedia('(prefers-color-scheme: dark)');
    private readonly themeObserver = new MutationObserver(() => this.syncThemeAssets());

    public constructor() {
        super();
        constructorFactory(ApplicationWrapper, styles).bind(this)();
        appEngine.shell = this as unknown as typeof appEngine.shell;
        this.setLanguage();
        this.applyAttributes();
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

    public setId: (this: ApplicationWrapper, id?: string) => void = setIdFirstFactory(ApplicationWrapper).bind(this);
    public static readonly createElement = createElementFactory(ApplicationWrapper);
    public static readonly define = defineFactory(ApplicationWrapper);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        if (this.hasHiddenChrome) {
            this.applyAttributes();
            return;
        }
        i18n.addEventListener('languagechange', this.setLanguage);
        this.element.language.addEventListener('language-switcher-select', this.changeLanguage as EventListener);
        this.element.appearance.addEventListener('appearance-mode-toggle', this.changeAppearance as EventListener);
        this.colorScheme.addEventListener('change', this.syncCurrentThemeAssets);
        this.themeObserver.observe(document.documentElement, {
            attributeFilter: ['data-theme'],
            attributes: true,
        });
        this.setLanguage();
        this.applyAttributes();
        this.syncThemeAssets();
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        this.element.language.removeEventListener('language-switcher-select', this.changeLanguage as EventListener);
        this.element.appearance.removeEventListener('appearance-mode-toggle', this.changeAppearance as EventListener);
        this.colorScheme.removeEventListener('change', this.syncCurrentThemeAssets);
        this.themeObserver.disconnect();
    }

    public attributeChangedCallback(): void {
        this.applyAttributes();
    }

    private get hasHiddenChrome(): boolean {
        return this.getAttribute('chrome') === 'none';
    }

    private get iconTheme(): Theme {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark' || theme === 'light') {
            return theme;
        }
        return this.colorScheme.matches ? 'dark' : 'light';
    }

    private readonly changeLanguage = (event: LanguageSwitcherSelectEvent): void => {
        event.preventDefault();
        appEngine.setLanguage(event.detail.locale);
    };

    private readonly changeAppearance = (event: AppearanceModeToggleEvent): void => {
        this.syncThemeAssets(event.detail.mode);
        requestAnimationFrame(() => this.syncThemeAssets());
    };

    private readonly syncCurrentThemeAssets = (): void => {
        this.syncThemeAssets();
    };

    /**
     * Apply localized title, description, and control labels.
     */
    public readonly setLanguage = (): void => {
        if (this.hasHiddenChrome) {
            return;
        }
        i18n.applyDocumentLanguage();
        this.element.title.textContent = i18n.page.app.title;
        this.element.description.textContent = i18n.page.app.description;
        this.element.language.setAttribute('button-label', i18n.page.shell.languageLabel);
        this.element.language.setAttribute('menu-label', i18n.page.shell.languageLabel);
        this.element.language.setAttribute('locale', i18n.locale);
        this.element.appearance.setAttribute('light-label', i18n.page.theme.light);
        this.element.appearance.setAttribute('dark-label', i18n.page.theme.dark);
    };

    private applyAttributes(): void {
        if (!this.element.logo || !this.element.appearance) {
            return;
        }
        if (this.hasHiddenChrome) {
            this.element.language.hidden = true;
            this.element.appearance.hidden = true;
            this.element.appearance.setAttribute('target-selector', `#${this.element.root.id}`);
            this.element.appearance.setAttribute('target-attribute', 'data-wrapper-theme');
            this.element.appearance.setAttribute('storage-key', `${this.element.root.id}:theme`);
            return;
        }
        this.element.language.hidden = false;
        this.element.appearance.hidden = false;
        this.element.appearance.setAttribute('storage-key', this.getAttribute('storage-key') || 'theme');
        this.syncThemeAssets();
    }

    private readonly syncThemeAssets = (theme: Theme = this.iconTheme): void => {
        this.syncLogo(theme);
        document.querySelectorAll<HTMLLinkElement>('link[data-appearance-icon]').forEach((icon) => {
            const href = theme === 'dark' ? icon.dataset.darkHref : icon.dataset.lightHref;
            if (href) {
                icon.href = `${href}${href.includes('?') ? '&' : '?'}theme=${theme}`;
            }
        });
    };

    private syncLogo(theme: Theme): void {
        const fixedLogo = this.getAttribute('logo-src');
        const darkLogo = this.getAttribute('logo-dark-src');
        const lightLogo = this.getAttribute('logo-light-src');
        if (fixedLogo && !darkLogo && !lightLogo) {
            this.element.logo.src = fixedLogo;
            return;
        }
        this.element.logo.src = theme === 'dark' ? darkLogo || '/images/mathjslab-logo-dark.svg' : lightLogo || '/images/mathjslab-logo-light.svg';
    }
}

ApplicationWrapper.define();
