import styles from './command-prompt-list.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import { CommandPrompt } from '../command-prompt/command-prompt.component';

/**
 * Elements addressed inside the command prompt list shadow tree.
 */
export interface CommandPromptListElementEntry {
    wrapper: HTMLElement;
    prompt: CommandPrompt[];
}

export type CommandPromptListElement = WebComponentElement<CommandPromptListElementEntry>;
export const CommandPromptListElementEntryKey: (keyof CommandPromptListElementEntry)[] = ['wrapper'] as const;

/**
 * Command prompt interpreter handler.
 */
export type CommandPromptEvalHandler<T = void> = (prompt: CommandPrompt, index?: number) => T;
export type PromptEvaluator<T = void> = CommandPromptEvalHandler<T>;

type CalcInputMode = 'app' | 'native';

type CalcInputModeEvent = CustomEvent<{
    mode: CalcInputMode;
}>;

const numericBasePrefixes = ['0b', '0o', '0x'];

/**
 * Shared command prompt list with prompt history, keyboard navigation, and
 * calculator keypad integration.
 */
export class CommandPromptList extends HTMLElement {
    public static readonly tagName = 'command-prompt-list';
    public readonly element = { prompt: [] as CommandPrompt[] } as CommandPromptListElement;
    public static readonly elementFields: (keyof CommandPromptListElementEntry)[] = CommandPromptListElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(CommandPromptListElementEntryKey);
    public static readonly null = null as unknown as CommandPromptList;
    public static readonly undefined = undefined as unknown as CommandPromptList;
    public promptIndex = -1;
    public evalPrompt: CommandPromptEvalHandler = () => {};
    public evalPromptRefresh: CommandPromptEvalHandler = () => {};
    private emptyPromptPrefix = '';
    private keyboardMode: CalcInputMode = 'app';

    public constructor() {
        super();
        constructorFactory(CommandPromptList, styles).bind(this)();
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

    public setId: (this: CommandPromptList, id?: string) => void = setIdFirstFactory(CommandPromptList).bind(this);
    public static readonly createElement = createElementFactory(CommandPromptList);
    public static readonly define = defineFactory(CommandPromptList);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
        globalThis.addEventListener('calc-input-mode-change', this.inputModeChange as EventListener);
        this.setLanguage();
        if (this.element.prompt.length === 0) {
            this.promptAppend();
        }
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        globalThis.removeEventListener('calc-input-mode-change', this.inputModeChange as EventListener);
    }

    /**
     * Active prompt used by calculator shells.
     */
    public get activePrompt(): CommandPrompt | null {
        return this.currentPrompt ?? null;
    }

    /**
     * Compatibility alias for calculator shells.
     */
    public set evaluator(evaluator: PromptEvaluator) {
        this.evalPrompt = evaluator;
    }

    public get evaluator(): PromptEvaluator {
        return this.evalPrompt;
    }

    /**
     * Previous prompt getter.
     */
    public get previousPrompt(): CommandPrompt {
        return this.element.prompt[this.promptIndex - 1]!;
    }

    /**
     * Current prompt getter.
     */
    public get currentPrompt(): CommandPrompt {
        return this.element.prompt[this.promptIndex]!;
    }

    /**
     * Next prompt getter.
     */
    public get nextPrompt(): CommandPrompt {
        return this.element.prompt[this.promptIndex + 1]!;
    }

    /**
     * Get all prompt input values.
     */
    public get statements(): string[] {
        return this.element.prompt.map((prompt) => prompt.value);
    }

    /**
     * Clears all prompts without creating a replacement.
     */
    public clear(): void {
        this.promptIndex = -1;
        this.element.prompt = [];
        this.element.wrapper.replaceChildren();
    }

    /**
     * Remove all prompts and create a fresh active prompt.
     */
    public clearAll(): void {
        this.clear();
        this.promptAppend();
        this.currentPrompt?.focusInput();
    }

    /**
     * Create a command prompt instance and wire list-level interaction events.
     */
    public promptCreate(text?: string | null): {
        newPrompt: CommandPrompt;
        resize: (_event?: Event) => void;
    } {
        const uid = globalThis.crypto.randomUUID();
        const newPrompt = CommandPrompt.createElement(uid);
        newPrompt.setKeyboardMode(this.keyboardMode);
        newPrompt.container = this.element.wrapper;
        newPrompt.value = text ?? '';
        newPrompt.element.input.addEventListener('focus', this.promptFocus);
        newPrompt.element.input.addEventListener('keydown', this.promptKeydown);
        newPrompt.element.input.addEventListener('change', newPrompt.resize);
        newPrompt.onClickFrameBox = (): void => {
            newPrompt.focusInput();
        };
        return {
            newPrompt,
            resize: newPrompt.resize,
        };
    }

    /**
     * Append a prompt with optional text without evaluating it.
     */
    public promptAppend(text?: string | null): {
        newPrompt: CommandPrompt;
        resize: (_event?: Event) => void;
    } {
        const { newPrompt, resize } = this.promptCreate(text);
        resize();
        this.element.prompt.push(newPrompt);
        this.promptIndex = this.element.prompt.length - 1;
        return {
            newPrompt,
            resize,
        };
    }

    /**
     * Append a prompt with optional text, then evaluate it.
     */
    public promptAdd(text?: string | null): void {
        const { newPrompt } = this.promptAppend(text);
        this.evalPrompt(newPrompt, this.promptIndex);
    }

    /**
     * Load and evaluate a group of statements, keeping a final empty prompt.
     */
    public promptLoadEval(statements: string[]): string[] {
        this.clear();
        if (statements.length === 0) {
            statements = [''];
        } else if (statements.at(-1)?.trim() !== '') {
            statements.push('');
        }
        for (const statement of statements) {
            this.promptAdd(statement);
        }
        this.element.prompt[0]?.focusInput();
        return statements;
    }

    /**
     * Configure the text used to initialize empty calculator prompts.
     */
    public setEmptyPromptPrefix(prefix: string): void {
        this.emptyPromptPrefix = prefix;
        if (!this.currentPrompt) {
            this.promptAppend();
            return;
        }
        if (this.currentPrompt.value === '' || numericBasePrefixes.includes(this.currentPrompt.value)) {
            this.setActivePromptValue(prefix);
        }
    }

    /**
     * Insert keypad text into the active prompt, creating one if needed.
     */
    public insertText(text: string): void {
        if (!this.currentPrompt) {
            this.promptAppend();
        }
        this.currentPrompt.insertText(text);
    }

    /**
     * Focus the active prompt, creating one when the history is empty.
     */
    public focusActive(): void {
        if (!this.currentPrompt) {
            this.promptAppend();
        }
        this.currentPrompt.focusInput();
    }

    /**
     * Delete selected text or one character before the cursor in the active prompt.
     */
    public backspace(): void {
        const input = this.currentPrompt?.element.input;
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

    /**
     * Clear the current prompt input and output.
     */
    public clearActive(): void {
        if (this.currentPrompt) {
            this.currentPrompt.value = '';
            this.currentPrompt.clearOutput();
            this.currentPrompt.focusInput();
        }
    }

    /**
     * Evaluate the active prompt through the configured evaluator.
     */
    public evaluateActive(): void {
        if (this.currentPrompt) {
            this.evaluate(this.currentPrompt);
        }
    }

    private readonly promptFocus = (event: Event): void => {
        this.promptIndex = this.indexOfPromptId((event.target as HTMLElement).id.substring(0, 36));
    };

    private readonly promptKeydown = (event: KeyboardEvent): void => {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        if (event.key === 'Enter' && !event.shiftKey) {
            this.enterPrompt(event);
        } else if (event.key === 'Backspace' && this.currentPrompt?.element.input.selectionStart === 0) {
            this.backspaceAtPromptStart(event);
        } else if (event.key === 'ArrowUp') {
            this.focusPreviousPromptFromFirstLine(event);
        } else if (event.key === 'ArrowDown') {
            this.focusNextPromptFromLastLine(event);
        }
    };

    private enterPrompt(event: KeyboardEvent): void {
        event.preventDefault();
        if (this.currentPrompt.element.input.selectionStart === 0) {
            const { newPrompt, resize } = this.promptCreate();
            this.evalPromptRefresh(newPrompt, this.promptIndex);
            this.element.prompt.splice(this.promptIndex, 0, newPrompt);
            this.promptIndex++;
            this.element.wrapper.insertBefore(newPrompt, this.currentPrompt);
            resize();
            return;
        }
        this.evaluate(this.currentPrompt);
    }

    private evaluate(prompt: CommandPrompt): void {
        if (!prompt.value.trim()) {
            return;
        }
        const currentPromptIndex = this.indexOfPrompt(prompt);
        const isLastPrompt = currentPromptIndex + 1 === this.element.prompt.length;
        let newPrompt: CommandPrompt | undefined;
        if (isLastPrompt) {
            newPrompt = this.promptAppend(this.emptyPromptPrefix).newPrompt;
        }
        this.evalPrompt(prompt, currentPromptIndex);
        const nextPrompt = newPrompt ?? this.element.prompt[currentPromptIndex + 1];
        if (nextPrompt) {
            this.promptIndex = this.indexOfPrompt(nextPrompt);
            nextPrompt.focusInput();
            nextPrompt.element.input.selectionStart = prompt.value.length;
        }
        this.evalPromptRefresh(prompt, currentPromptIndex);
    }

    private backspaceAtPromptStart(event: KeyboardEvent): void {
        const deletePrompt = (index: number): void => {
            this.element.prompt[index]!.element.wrapper.remove();
            this.element.prompt.splice(index, 1);
            this.promptIndex = Math.max(0, this.promptIndex - 1);
            event.preventDefault();
        };
        if (this.promptIndex !== 0 && this.previousPrompt.element.input.value.trim() === '') {
            deletePrompt(this.promptIndex - 1);
        } else if (this.element.prompt.length > 1 && this.currentPrompt.element.input.value.trim() === '') {
            deletePrompt(this.promptIndex);
            this.currentPrompt.focusInput();
        }
    }

    private focusPreviousPromptFromFirstLine(event: KeyboardEvent): void {
        const input = this.currentPrompt?.element.input;
        if (input && this.promptIndex > 0 && input.selectionStart <= (input.value.split(/\r?\n/)[0]?.length ?? 0)) {
            this.previousPrompt.focusInput();
            event.preventDefault();
        }
    }

    private focusNextPromptFromLastLine(event: KeyboardEvent): void {
        const input = this.currentPrompt?.element.input;
        if (input && this.promptIndex + 1 < this.element.prompt.length && input.selectionStart >= input.value.split(/\r?\n/).slice(0, -1).join('\n').length) {
            this.nextPrompt.focusInput();
            event.preventDefault();
        }
    }

    private setActivePromptValue(value: string): void {
        if (!this.currentPrompt) {
            return;
        }
        this.currentPrompt.value = value;
        this.currentPrompt.focusInput();
        this.currentPrompt.element.input.setSelectionRange(value.length, value.length);
    }

    private readonly inputModeChange = (event: CalcInputModeEvent): void => {
        this.keyboardMode = event.detail.mode;
        this.currentPrompt?.setKeyboardMode(this.keyboardMode);
    };

    private readonly setLanguage = (): void => {
        this.element.wrapper.setAttribute('aria-label', i18n.page.prompt.listAriaLabel);
    };

    private indexOfPrompt(prompt: CommandPrompt): number {
        return this.indexOfPromptId(prompt.id);
    }

    private indexOfPromptId(id: string): number {
        return this.element.prompt.map((prompt) => prompt.id).indexOf(id);
    }
}

CommandPromptList.define();
