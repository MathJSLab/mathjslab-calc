import styles from './calc-prompt.styles.scss';
import i18n from '../../i18n.js';
import type WebComponentElement from '../WebComponentElement.js';
import constructorFactory from '../constructorFactory.js';
import createElementFactory from '../createElementFactory.js';
import defineFactory from '../defineFactory.js';
import keyToPostfix from '../keyToPostfix.js';
import setContainerFactory from '../setContainerFactory.js';
import setIdFirstFactory from '../setIdFirstFactory.js';

export interface CalcPromptElementEntry {
    root: HTMLElement;
    input: HTMLTextAreaElement;
    output: HTMLOutputElement;
}

export type CalcPromptElement = WebComponentElement<CalcPromptElementEntry>;
export const CalcPromptElementEntryKey: (keyof CalcPromptElementEntry)[] = ['root', 'input', 'output'] as const;

export class CalcPrompt extends HTMLElement {
    public static readonly tagName = 'calc-prompt';
    public readonly element = {} as CalcPromptElement;
    public static readonly elementFields: (keyof CalcPromptElementEntry)[] = CalcPromptElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(CalcPromptElementEntryKey);
    public static readonly null = null as unknown as CalcPrompt;
    public static readonly undefined = undefined as unknown as CalcPrompt;

    public constructor() {
        super();
        constructorFactory(CalcPrompt, styles).bind(this)();
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

    public setId: (this: CalcPrompt, id?: string) => void = setIdFirstFactory(CalcPrompt).bind(this);
    public static readonly createElement = createElementFactory(CalcPrompt);
    public static readonly define = defineFactory(CalcPrompt);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
        this.element.input.addEventListener('input', this.resize);
        this.element.input.addEventListener('keydown', this.keydown);
        this.setLanguage();
        this.resize();
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        this.element.input.removeEventListener('input', this.resize);
        this.element.input.removeEventListener('keydown', this.keydown);
    }

    public get value(): string {
        return this.element.input.value;
    }

    public set value(value: string) {
        this.element.input.value = value;
        this.resize();
    }

    public focusInput(): void {
        this.element.input.focus();
    }

    public insertText(text: string): void {
        const input = this.element.input;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.setRangeText(text, start, end, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        this.focusInput();
    }

    public setOutput(html: string): void {
        this.element.output.innerHTML = html;
    }

    public clearOutput(): void {
        this.element.output.replaceChildren();
    }

    private readonly resize = (): void => {
        this.element.input.style.height = '1px';
        this.element.input.style.height = `${this.element.input.scrollHeight}px`;
    };

    private readonly keydown = (event: KeyboardEvent): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.dispatchEvent(new CustomEvent('calc-prompt-evaluate', { bubbles: true, composed: true, detail: { prompt: this } }));
        }
    };

    private readonly setLanguage = (): void => {
        this.element.input.setAttribute('aria-label', i18n.page.prompt.ariaLabel);
    };
}

CalcPrompt.define();
