import styles from './calc-prompt-list.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import { CalcPrompt } from '../calc-prompt/calc-prompt.component';

export interface CalcPromptListElementEntry {
    root: HTMLElement;
}

export type CalcPromptListElement = WebComponentElement<CalcPromptListElementEntry>;
export const CalcPromptListElementEntryKey: (keyof CalcPromptListElementEntry)[] = ['root'] as const;

export type PromptEvaluator = (prompt: CalcPrompt) => void;

export class CalcPromptList extends HTMLElement {
    public static readonly tagName = 'calc-prompt-list';
    public readonly element = {} as CalcPromptListElement;
    public static readonly elementFields: (keyof CalcPromptListElementEntry)[] = CalcPromptListElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(CalcPromptListElementEntryKey);
    public static readonly null = null as unknown as CalcPromptList;
    public static readonly undefined = undefined as unknown as CalcPromptList;
    public evaluator: PromptEvaluator = () => {};
    private activePrompt: CalcPrompt | null = null;

    public constructor() {
        super();
        constructorFactory(CalcPromptList, styles).bind(this)();
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

    public setId: (this: CalcPromptList, id?: string) => void = setIdFirstFactory(CalcPromptList).bind(this);
    public static readonly createElement = createElementFactory(CalcPromptList);
    public static readonly define = defineFactory(CalcPromptList);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
        this.addEventListener('calc-prompt-evaluate', this.evaluateEvent as EventListener);
        this.setLanguage();
        if (!this.activePrompt) {
            this.appendPrompt();
        }
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        this.removeEventListener('calc-prompt-evaluate', this.evaluateEvent as EventListener);
    }

    public appendPrompt(value = ''): CalcPrompt {
        const prompt = document.createElement(CalcPrompt.tagName) as CalcPrompt;
        prompt.value = value;
        this.element.root.append(prompt);
        this.activePrompt = prompt;
        prompt.focusInput();
        return prompt;
    }

    public insertText(text: string): void {
        if (!this.activePrompt) {
            this.appendPrompt();
        }
        this.activePrompt!.insertText(text);
    }

    public backspace(): void {
        const input = this.activePrompt?.element.input;
        if (!input) {
            return;
        }
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start === end && start > 0) {
            input.setRangeText('', start - 1, end, 'end');
        } else {
            input.setRangeText('', start, end, 'end');
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    public clearActive(): void {
        if (this.activePrompt) {
            this.activePrompt.value = '';
            this.activePrompt.clearOutput();
            this.activePrompt.focusInput();
        }
    }

    public evaluateActive(): void {
        if (this.activePrompt) {
            this.evaluate(this.activePrompt);
        }
    }

    private evaluate(prompt: CalcPrompt): void {
        if (!prompt.value.trim()) {
            return;
        }
        this.evaluator(prompt);
        if (prompt === this.activePrompt) {
            this.appendPrompt();
        }
    }

    private readonly evaluateEvent = (event: CustomEvent<{ prompt: CalcPrompt }>): void => {
        event.stopPropagation();
        this.evaluate(event.detail.prompt);
    };

    private readonly setLanguage = (): void => {
        this.element.root.setAttribute('aria-label', i18n.page.prompt.listAriaLabel);
    };
}

CalcPromptList.define();
