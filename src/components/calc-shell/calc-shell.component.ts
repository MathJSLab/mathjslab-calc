import type { NodeInput } from 'mathjslab';
import styles from './calc-shell.styles.scss';
import '../../InterpreterConfiguration';
import { appEngine } from '../../appEngine';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import { CalcPrompt } from '../calc-prompt/calc-prompt.component';
import { CalcPromptList } from '../calc-prompt-list/calc-prompt-list.component';

/**
 * Elements addressed inside the calculator shell shadow tree.
 */
export interface CalcShellElementEntry {
    root: HTMLElement;
    workspace: HTMLElement;
    title: HTMLElement;
    description: HTMLElement;
    languageLabel: HTMLElement;
    language: HTMLSelectElement;
    toggle: HTMLButtonElement;
    prompts: CalcPromptList;
    panel: HTMLElement;
    keypad: HTMLElement;
}

export type CalcShellElement = WebComponentElement<CalcShellElementEntry>;
export const CalcShellElementEntryKey: (keyof CalcShellElementEntry)[] = [
    'root',
    'workspace',
    'title',
    'description',
    'languageLabel',
    'language',
    'toggle',
    'prompts',
    'panel',
    'keypad',
] as const;

type CalculatorKeyEvent = CustomEvent<{
    action: 'insert' | 'backspace' | 'clear' | 'evaluate';
    value: string;
}>;

/**
 * Top-level calculator component that connects prompts, keypad and interpreter.
 */
export class CalcShell extends HTMLElement {
    public static readonly tagName = 'calc-shell';
    public readonly element = {} as CalcShellElement;
    public static readonly elementFields: (keyof CalcShellElementEntry)[] = CalcShellElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(CalcShellElementEntryKey);
    public static readonly null = null as unknown as CalcShell;
    public static readonly undefined = undefined as unknown as CalcShell;
    private panelOpen = true;

    public constructor() {
        super();
        constructorFactory(CalcShell, styles).bind(this)();
        appEngine.shell = this;
        this.element.prompts.evaluator = this.evaluatePrompt;
        this.renderLanguageOptions();
        this.setLanguage();
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

    public setId: (this: CalcShell, id?: string) => void = setIdFirstFactory(CalcShell).bind(this);
    public static readonly createElement = createElementFactory(CalcShell);
    public static readonly define = defineFactory(CalcShell);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
        this.element.language.addEventListener('change', this.changeLanguage);
        this.element.toggle.addEventListener('click', this.togglePanel);
        this.addEventListener('calculator-key', this.keyInput as EventListener);
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        this.element.language.removeEventListener('change', this.changeLanguage);
        this.element.toggle.removeEventListener('click', this.togglePanel);
        this.removeEventListener('calculator-key', this.keyInput as EventListener);
    }

    /**
     * Toggle the keypad panel without losing focus from the active prompt.
     */
    private readonly togglePanel = (): void => {
        this.panelOpen = !this.panelOpen;
        this.element.workspace.dataset.panel = this.panelOpen ? 'open' : 'closed';
        this.element.toggle.setAttribute('aria-expanded', String(this.panelOpen));
        this.element.prompts.insertText('');
    };

    /**
     * Translate keypad events into prompt list actions.
     */
    private readonly keyInput = (event: CalculatorKeyEvent): void => {
        event.stopPropagation();
        const { action, value } = event.detail;
        if (action === 'insert') {
            this.element.prompts.insertText(value);
        } else if (action === 'backspace') {
            this.element.prompts.backspace();
        } else if (action === 'clear') {
            this.element.prompts.clearActive();
        } else {
            this.element.prompts.evaluateActive();
        }
    };

    /**
     * Build the language selector from the shared i18n service.
     */
    private renderLanguageOptions(): void {
        this.element.language.replaceChildren();
        for (const locale of i18n.locales) {
            const option = document.createElement('option');
            option.value = locale;
            option.textContent = i18n.languageNames[locale];
            this.element.language.append(option);
        }
    }

    private readonly changeLanguage = (): void => {
        appEngine.setLanguage(this.element.language.value);
    };

    /**
     * Apply localized strings to the shell controls.
     */
    private readonly setLanguage = (): void => {
        i18n.applyDocumentLanguage();
        this.element.title.textContent = i18n.page.app.title;
        this.element.description.textContent = i18n.page.app.description;
        this.element.languageLabel.textContent = i18n.page.shell.languageLabel;
        this.element.language.setAttribute('aria-label', i18n.page.shell.languageLabel);
        this.element.language.value = i18n.locale;
        this.element.toggle.title = i18n.page.shell.toggleKeypad;
        this.element.toggle.setAttribute('aria-label', i18n.page.shell.toggleKeypad);
    };

    /**
     * Parse and evaluate one prompt with the shared MathJSLab interpreter.
     */
    private readonly evaluatePrompt = (prompt: CalcPrompt): void => {
        let tree: NodeInput | undefined;
        const { interpreter } = appEngine;
        try {
            tree = interpreter.Parse(prompt.value);
            const evaluated = interpreter.Evaluate(tree);
            const inputText = interpreter.Unparse(tree);
            const resultText = interpreter.Unparse(evaluated);
            const inputMath = interpreter.UnparseMathML(tree);
            const resultMath = interpreter.UnparseMathML(evaluated);

            if (inputText === resultText) {
                prompt.setOutput(`<table><tr><td>${inputMath}</td></tr></table>`);
            } else {
                prompt.setOutput(
                    `<table><tr><td>${inputMath}</td><td><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mo>=</mo></math></td><td>${resultMath}</td></tr></table>`,
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const parsedInput = tree ? `<table><tr><td>${interpreter.UnparseMathML(tree)}</td></tr></table>` : '';
            prompt.setOutput(`${parsedInput}<pre class="error">${message}</pre>`);
            if (interpreter.debug) {
                throw error;
            }
        }
    };
}

CalcShell.define();
