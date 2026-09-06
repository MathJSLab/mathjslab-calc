import hljs from 'highlight.js/lib/core';
import matlab from 'highlight.js/lib/languages/matlab';
import styles from './command-prompt.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

hljs.registerLanguage('matlab', matlab);

/**
 * Elements addressed inside a single prompt shadow tree.
 */
export interface CommandPromptElementEntry {
    wrapper: HTMLElement;
    frameBox: HTMLElement;
    root: HTMLElement;
    inputStack: HTMLElement;
    highlight: HTMLElement;
    input: HTMLTextAreaElement;
    outputScroller: HTMLDivElement;
    output: HTMLDivElement;
}

export type CommandPromptElement = WebComponentElement<CommandPromptElementEntry>;
export const CommandPromptElementEntryKey: (keyof CommandPromptElementEntry)[] = ['wrapper', 'frameBox', 'root', 'inputStack', 'highlight', 'input', 'outputScroller', 'output'] as const;

type CalcInputMode = 'app' | 'native';

type CalcInputModeEvent = CustomEvent<{
    mode: CalcInputMode;
}>;

const nativeKeyboardSuppressionMedia = '(pointer: coarse) and (max-width: 680px), (pointer: coarse) and (max-height: 520px)';

/**
 * Editable prompt row with shared input handling and rendered output support.
 */
export class CommandPrompt extends HTMLElement {
    public static readonly tagName = 'command-prompt';
    public readonly element = {} as CommandPromptElement;
    public static readonly elementFields: (keyof CommandPromptElementEntry)[] = CommandPromptElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(CommandPromptElementEntryKey);
    public static readonly null = null as unknown as CommandPrompt;
    public static readonly undefined = undefined as unknown as CommandPrompt;
    public onClickFrameBox?: (event?: Event) => void;
    private readonly nativeKeyboardSuppression = globalThis.matchMedia(nativeKeyboardSuppressionMedia);
    private keyboardMode: CalcInputMode = 'native';

    public constructor() {
        super();
        constructorFactory(CommandPrompt, styles).bind(this)();
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

    public setId: (this: CommandPrompt, id?: string) => void = setIdFirstFactory(CommandPrompt).bind(this);
    public static readonly createElement = createElementFactory(CommandPrompt);
    public static readonly define = defineFactory(CommandPrompt);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
        this.element.input.addEventListener('input', this.renderInput);
        this.element.input.addEventListener('change', this.renderInput);
        this.element.input.addEventListener('scroll', this.syncHighlightScroll);
        this.element.input.addEventListener('cut', this.delayedResize);
        this.element.input.addEventListener('paste', this.delayedResize);
        this.element.input.addEventListener('drop', this.delayedResize);
        this.element.input.addEventListener('keydown', this.keydown);
        this.element.frameBox.addEventListener('click', this.clickFrameBox);
        this.nativeKeyboardSuppression.addEventListener('change', this.layoutChange);
        globalThis.addEventListener('calc-input-mode-change', this.inputModeChange as EventListener);
        this.setInputMode();
        this.setLanguage();
        this.renderInput();
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
        this.element.input.removeEventListener('input', this.renderInput);
        this.element.input.removeEventListener('change', this.renderInput);
        this.element.input.removeEventListener('scroll', this.syncHighlightScroll);
        this.element.input.removeEventListener('cut', this.delayedResize);
        this.element.input.removeEventListener('paste', this.delayedResize);
        this.element.input.removeEventListener('drop', this.delayedResize);
        this.element.input.removeEventListener('keydown', this.keydown);
        this.element.frameBox.removeEventListener('click', this.clickFrameBox);
        this.nativeKeyboardSuppression.removeEventListener('change', this.layoutChange);
        globalThis.removeEventListener('calc-input-mode-change', this.inputModeChange as EventListener);
    }

    public get value(): string {
        return this.element.input.value;
    }

    /**
     * Replace the prompt input text and resize the textarea.
     */
    public set value(value: string) {
        this.element.input.value = value;
        this.renderInput();
    }

    public focusInput(): void {
        this.element.input.focus();
    }

    /**
     * Insert text at the current cursor or selection.
     */
    public insertText(text: string): void {
        const input = this.element.input;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.setRangeText(text, start, end, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        this.focusInput();
    }

    /**
     * Render trusted MathJSLab output generated by the interpreter.
     */
    public setOutput(html: string): void {
        this.element.output.innerHTML = html;
    }

    /**
     * Clear the rendered output area.
     */
    public clearOutput(): void {
        this.element.output.replaceChildren();
        this.element.frameBox.className = 'green-panel good';
    }

    /**
     * Apply the keyboard policy chosen by the containing shell.
     */
    public setKeyboardMode(mode: CalcInputMode): void {
        this.keyboardMode = mode;
        this.setInputMode();
    }

    /**
     * Resize the textarea to fit its current content.
     */
    public readonly resize = (): void => {
        this.element.input.style.height = '1px';
        this.element.input.style.height = `${this.element.input.scrollHeight}px`;
        this.element.highlight.style.minHeight = this.element.input.style.height;
        this.renderHighlight();
    };

    private readonly delayedResize = (): void => {
        globalThis.setTimeout(this.renderInput, 0);
    };

    private readonly keydown = (event: KeyboardEvent): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.dispatchEvent(new CustomEvent('command-prompt-evaluate', { bubbles: true, composed: true, detail: { prompt: this } }));
        }
        this.delayedResize();
    };

    /**
     * Render syntax highlighting and resize the editable prompt input.
     */
    private readonly renderInput = (): void => {
        this.resize();
        this.syncHighlightScroll();
    };

    /**
     * Keep the highlight layer aligned when the textarea scroll position moves.
     */
    private readonly syncHighlightScroll = (): void => {
        this.element.highlight.style.transform = `translate(${-this.element.input.scrollLeft}px, ${-this.element.input.scrollTop}px)`;
    };

    /**
     * Render MATLAB-style syntax highlighting for the prompt source.
     */
    private renderHighlight(): void {
        const code = this.value || ' ';
        const highlighted = hljs.highlight(code, { language: 'matlab', ignoreIllegals: true }).value;
        this.element.highlight.innerHTML = highlighted.endsWith('\n') ? `${highlighted} ` : highlighted;
    }

    private readonly clickFrameBox = (event?: Event): void => {
        if (this.onClickFrameBox) {
            this.onClickFrameBox(event);
        }
    };

    private readonly setLanguage = (): void => {
        this.element.input.setAttribute('aria-label', i18n.page.prompt.ariaLabel);
    };

    /**
     * Suppress the native virtual keyboard only while touch devices use the app keypad.
     */
    private setInputMode(): void {
        if (this.nativeKeyboardSuppression.matches && this.keyboardMode === 'app') {
            this.element.input.inputMode = 'none';
            this.element.input.readOnly = true;
            this.element.input.setAttribute('virtualkeyboardpolicy', 'manual');
        } else {
            this.element.input.inputMode = '';
            this.element.input.readOnly = false;
            this.element.input.removeAttribute('virtualkeyboardpolicy');
        }
    }

    private readonly layoutChange = (): void => {
        this.setInputMode();
    };

    private readonly inputModeChange = (event: CalcInputModeEvent): void => {
        this.setKeyboardMode(event.detail.mode);
    };
}

CommandPrompt.define();
