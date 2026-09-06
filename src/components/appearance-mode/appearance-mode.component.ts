import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import styles from './appearance-mode.styles.scss';

export type AppearanceModeValue = 'dark' | 'light';

/**
 * Elements addressed inside the appearance mode button shadow tree.
 */
export interface AppearanceModeElementEntry {
    toggle: HTMLButtonElement;
    icon: HTMLImageElement;
}

export type AppearanceModeElement = WebComponentElement<AppearanceModeElementEntry>;
export const AppearanceModeElementEntryKey: (keyof AppearanceModeElementEntry)[] = ['toggle', 'icon'] as const;

export type AppearanceModeToggleDetail = {
    mode: AppearanceModeValue;
};

export type AppearanceModeToggleEvent = CustomEvent<AppearanceModeToggleDetail>;

/**
 * Icon-only button used to switch between light and dark appearance modes.
 */
export class AppearanceMode extends HTMLElement {
    public static readonly tagName = 'appearance-mode';
    public readonly element = {} as AppearanceModeElement;
    public static readonly elementFields: (keyof AppearanceModeElementEntry)[] = AppearanceModeElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(AppearanceModeElementEntryKey);
    public static readonly null = null as unknown as AppearanceMode;
    public static readonly undefined = undefined as unknown as AppearanceMode;
    public static readonly observedAttributes = ['dark-icon-src', 'dark-label', 'light-icon-src', 'light-label', 'mode', 'storage-key', 'target-attribute', 'target-selector'];

    public constructor() {
        super();
        constructorFactory(AppearanceMode, styles).bind(this)();
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

    public setId: (this: AppearanceMode, id?: string) => void = setIdFirstFactory(AppearanceMode).bind(this);
    public static readonly createElement = createElementFactory(AppearanceMode);
    public static readonly define = defineFactory(AppearanceMode);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        this.element.toggle.addEventListener('click', this.toggleMode);
        if (!this.hasAttribute('mode')) {
            this.setAttribute('mode', this.initialMode);
        }
        this.applyMode(this.mode, false);
        this.render();
    }

    public disconnectedCallback(): void {
        this.element.toggle.removeEventListener('click', this.toggleMode);
    }

    public attributeChangedCallback(): void {
        if (this.isConnected) {
            this.render();
        }
    }

    /**
     * Render the icon and accessible label for the available action.
     */
    public render(): void {
        const nextMode = this.nextMode;
        this.element.icon.src = this.iconFor(nextMode);
        this.element.toggle.setAttribute('aria-label', this.labelFor(nextMode));
        this.element.toggle.title = this.labelFor(nextMode);
    }

    private get mode(): AppearanceModeValue {
        return this.getAttribute('mode') === 'dark' ? 'dark' : 'light';
    }

    private get initialMode(): AppearanceModeValue {
        const storedMode = globalThis.localStorage?.getItem(this.storageKey);
        if (storedMode === 'dark' || storedMode === 'light') {
            return storedMode;
        }
        return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private get nextMode(): AppearanceModeValue {
        return this.mode === 'dark' ? 'light' : 'dark';
    }

    private get storageKey(): string {
        return this.getAttribute('storage-key') || 'theme';
    }

    private get targetAttribute(): string {
        return this.getAttribute('target-attribute') || 'data-theme';
    }

    private iconFor(mode: AppearanceModeValue): string {
        const attribute = mode === 'dark' ? 'dark-icon-src' : 'light-icon-src';
        return this.getAttribute(attribute) || `/images/theme-${mode}-mathjslab.svg`;
    }

    private labelFor(mode: AppearanceModeValue): string {
        const attribute = mode === 'dark' ? 'dark-label' : 'light-label';
        return this.getAttribute(attribute) || mode;
    }

    private get target(): HTMLElement {
        const selector = this.getAttribute('target-selector');
        return (selector ? document.querySelector<HTMLElement>(selector) : null) || document.documentElement;
    }

    private applyMode(mode: AppearanceModeValue, persist = true): void {
        this.target.setAttribute(this.targetAttribute, mode);
        if (persist) {
            globalThis.localStorage?.setItem(this.storageKey, mode);
        }
    }

    private readonly toggleMode = (): void => {
        const event = new CustomEvent<AppearanceModeToggleDetail>('appearance-mode-toggle', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                mode: this.nextMode,
            },
        });
        if (this.dispatchEvent(event)) {
            this.applyMode(event.detail.mode);
            this.setAttribute('mode', event.detail.mode);
        }
    };
}

AppearanceMode.define();
