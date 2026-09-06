import styles from './control-bar.styles.scss';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

export type ControlBarAlignment = 'center' | 'end' | 'start' | 'stretch';
export type ControlBarOrientation = 'horizontal' | 'vertical';
export type ControlBarPanel = 'green' | 'none';
export type ControlBarWidth = 'fit' | 'full';
export type ControlBarButtonStyle = 'default' | 'preserve';

/**
 * Elements addressed inside the control bar shadow tree.
 */
export interface ControlBarElementEntry {
    root: HTMLElement;
    slot: HTMLSlotElement;
}

export type ControlBarElement = WebComponentElement<ControlBarElementEntry>;
export const ControlBarElementEntryKey: (keyof ControlBarElementEntry)[] = ['root', 'slot'] as const;

/**
 * General-purpose navigation container for command buttons and controls.
 */
export class ControlBar extends HTMLElement {
    public static readonly tagName = 'control-bar';
    public readonly element = {} as ControlBarElement;
    public static readonly elementFields: (keyof ControlBarElementEntry)[] = ControlBarElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(ControlBarElementEntryKey);
    public static readonly null = null as unknown as ControlBar;
    public static readonly undefined = undefined as unknown as ControlBar;
    public static readonly observedAttributes = ['align', 'aria-label', 'button-style', 'orientation', 'panel', 'width'];

    public constructor() {
        super();
        constructorFactory(ControlBar, styles).bind(this)();
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

    public setId: (this: ControlBar, id?: string) => void = setIdFirstFactory(ControlBar).bind(this);
    public static readonly createElement = createElementFactory(ControlBar);
    public static readonly define = defineFactory(ControlBar);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        this.element.slot?.addEventListener('slotchange', this.updateSlottedButtons);
        this.applyAttributes();
    }

    public disconnectedCallback(): void {
        this.element.slot?.removeEventListener('slotchange', this.updateSlottedButtons);
    }

    public attributeChangedCallback(): void {
        this.applyAttributes();
    }

    private get align(): ControlBarAlignment {
        const align = this.getAttribute('align');
        return align === 'center' || align === 'end' || align === 'stretch' ? align : 'start';
    }

    private get orientation(): ControlBarOrientation {
        return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
    }

    private get panel(): ControlBarPanel {
        const panel = this.getAttribute('panel');
        return panel === null || panel === 'none' || panel === 'false' ? 'none' : 'green';
    }

    private get width(): ControlBarWidth {
        return this.getAttribute('width') === 'fit' ? 'fit' : 'full';
    }

    private get buttonStyle(): ControlBarButtonStyle {
        return this.getAttribute('button-style') === 'preserve' ? 'preserve' : 'default';
    }

    /**
     * Reflect host options into the internal navigation element.
     */
    private applyAttributes(): void {
        if (!this.element.root) {
            return;
        }
        this.element.root.setAttribute('aria-label', this.getAttribute('aria-label') || 'Controls');
        this.element.root.dataset.align = this.align;
        this.element.root.dataset.orientation = this.orientation;
        this.element.root.dataset.panel = this.panel;
        this.element.root.dataset.width = this.width;
        this.element.root.classList.toggle('green-panel', this.panel === 'green');
        this.updateSlottedButtons();
    }

    /**
     * Apply light-DOM button classes so page-level styles and slotted styles agree.
     */
    private readonly updateSlottedButtons = (): void => {
        if (!this.element.slot) {
            return;
        }
        const preserveButtons = this.buttonStyle === 'preserve';
        const useGrayButtons = this.panel === 'green';
        this.element.slot.assignedElements({ flatten: true }).forEach((element) => {
            if (!(element instanceof HTMLButtonElement)) {
                return;
            }
            element.classList.toggle('gray-button', !preserveButtons && useGrayButtons);
            element.classList.toggle('green-button', !preserveButtons && !useGrayButtons);
        });
    };
}

ControlBar.define();
