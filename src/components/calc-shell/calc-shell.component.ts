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

type CalculatorBaseEvent = CustomEvent<{
    prefix: string;
}>;

type CalcInputMode = 'app' | 'native';

const nativeKeyboardSwitchMedia = '(pointer: coarse) and (max-width: 680px), (pointer: coarse) and (max-height: 520px)';

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
    private readonly nativeKeyboardSwitch = globalThis.matchMedia(nativeKeyboardSwitchMedia);
    private panelOpen = true;
    private keyboardMode: CalcInputMode = 'app';

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
        this.addEventListener('calculator-base-change', this.baseInput as EventListener);
        this.nativeKeyboardSwitch.addEventListener('change', this.layoutChange);
        this.applyInputMode();
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        this.element.language.removeEventListener('change', this.changeLanguage);
        this.element.toggle.removeEventListener('click', this.togglePanel);
        this.removeEventListener('calculator-key', this.keyInput as EventListener);
        this.removeEventListener('calculator-base-change', this.baseInput as EventListener);
        this.nativeKeyboardSwitch.removeEventListener('change', this.layoutChange);
    }

    /**
     * Toggle the keypad panel on desktop and the input mode on mobile.
     */
    private readonly togglePanel = (): void => {
        if (this.nativeKeyboardSwitch.matches) {
            this.keyboardMode = this.keyboardMode === 'app' ? 'native' : 'app';
            this.applyInputMode();
            globalThis.setTimeout(() => this.element.prompts.focusActive());
            return;
        }

        this.panelOpen = !this.panelOpen;
        this.applyPanelState();
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
     * Apply programming numeric base prefixes to empty prompts.
     */
    private readonly baseInput = (event: CalculatorBaseEvent): void => {
        event.stopPropagation();
        this.element.prompts.setEmptyPromptPrefix(event.detail.prefix);
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
     * Apply the shell panel state to layout and accessibility attributes.
     */
    private applyPanelState(): void {
        this.element.workspace.dataset.panel = this.panelOpen ? 'open' : 'closed';
        this.element.toggle.setAttribute('aria-expanded', String(this.panelOpen));
    }

    /**
     * Coordinate the visible keypad and prompt input policy.
     */
    private applyInputMode(): void {
        if (this.nativeKeyboardSwitch.matches) {
            this.panelOpen = this.keyboardMode === 'app';
            globalThis.dispatchEvent(new CustomEvent('calc-input-mode-change', { detail: { mode: this.keyboardMode } }));
            this.element.toggle.setAttribute('aria-pressed', String(this.keyboardMode === 'native'));
            this.element.toggle.dataset.mode = this.keyboardMode;
        } else {
            this.keyboardMode = 'app';
            this.element.toggle.removeAttribute('aria-pressed');
            delete this.element.toggle.dataset.mode;
        }

        this.applyPanelState();
        this.setToggleLabel();
    }

    /**
     * Restore the app keypad whenever the layout leaves the compact touch mode.
     */
    private readonly layoutChange = (): void => {
        if (!this.nativeKeyboardSwitch.matches) {
            this.keyboardMode = 'app';
        }
        this.applyInputMode();
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
        this.setToggleLabel();
    };

    /**
     * Localize the keypad mode button according to the next available action.
     */
    private setToggleLabel(): void {
        const label =
            this.nativeKeyboardSwitch.matches && this.keyboardMode === 'app'
                ? i18n.page.shell.useNativeKeyboard
                : this.nativeKeyboardSwitch.matches && this.keyboardMode === 'native'
                  ? i18n.page.shell.useAppKeypad
                  : i18n.page.shell.toggleKeypad;
        this.element.toggle.title = label;
        this.element.toggle.setAttribute('aria-label', label);
    }

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
