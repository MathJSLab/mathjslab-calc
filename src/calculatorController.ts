import type { NodeInput } from 'mathjslab';
import { appEngine } from './appEngine';
import i18n from './i18n';
import { insertOutput, outputFunction } from './outputFunction';
import type { CommandPrompt } from './components/command-prompt/command-prompt.component';
import type { CommandPromptList } from './components/command-prompt-list/command-prompt-list.component';

type KeyboardPanelKeyEvent = CustomEvent<{
    action: 'insert' | 'backspace' | 'clear' | 'evaluate';
    value: string;
}>;

type KeyboardPanelBaseEvent = CustomEvent<{
    prefix: string;
}>;

type CalcInputMode = 'app' | 'native';

const nativeKeyboardSwitchMedia = '(pointer: coarse) and (max-width: 680px), (pointer: coarse) and (max-height: 520px)';

/**
 * Connect the calculator prompt list and keyboard panel.
 */
export class CalculatorController {
    private readonly nativeKeyboardSwitch = globalThis.matchMedia(nativeKeyboardSwitchMedia);
    private readonly workspace: HTMLElement;
    private readonly toggle: HTMLButtonElement;
    private panelOpen = true;
    private keyboardMode: CalcInputMode = 'app';

    public constructor(private readonly prompts: CommandPromptList) {
        const workspace = document.getElementById('calc-workspace');
        const toggle = document.getElementById('calc-keyboard-toggle');
        if (!(workspace instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) {
            throw new Error('missing calculator workspace controls');
        }
        this.workspace = workspace;
        this.toggle = toggle;
        this.prompts.evaluator = this.evaluatePrompt;
    }

    /**
     * Attach runtime listeners and apply the startup input mode.
     */
    public connect(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
        this.toggle.addEventListener('click', this.togglePanel);
        document.addEventListener('keyboard-panel-key', this.keyInput as EventListener);
        document.addEventListener('keyboard-panel-base-change', this.baseInput as EventListener);
        this.nativeKeyboardSwitch.addEventListener('change', this.layoutChange);
        this.applyInputMode();
        this.setLanguage();
    }

    /**
     * Toggle the keyboard panel on desktop and the input mode on mobile.
     */
    private readonly togglePanel = (): void => {
        if (this.nativeKeyboardSwitch.matches) {
            this.keyboardMode = this.keyboardMode === 'app' ? 'native' : 'app';
            this.applyInputMode();
            globalThis.setTimeout(() => this.prompts.focusActive());
            return;
        }

        this.panelOpen = !this.panelOpen;
        this.applyPanelState();
        this.prompts.insertText('');
    };

    /**
     * Translate keyboard panel events into prompt list actions.
     */
    private readonly keyInput = (event: KeyboardPanelKeyEvent): void => {
        event.stopPropagation();
        const { action, value } = event.detail;
        if (action === 'insert') {
            this.prompts.insertText(value);
        } else if (action === 'backspace') {
            this.prompts.backspace();
        } else if (action === 'clear') {
            this.prompts.clearAll();
        } else {
            this.prompts.evaluateActive();
        }
    };

    /**
     * Apply programming numeric base prefixes to empty prompts.
     */
    private readonly baseInput = (event: KeyboardPanelBaseEvent): void => {
        event.stopPropagation();
        this.prompts.setEmptyPromptPrefix(event.detail.prefix);
    };

    /**
     * Reflect the current keypad visibility state in layout data and ARIA.
     */
    private applyPanelState(): void {
        this.workspace.dataset.panel = this.panelOpen ? 'open' : 'closed';
        this.toggle.setAttribute('aria-expanded', String(this.panelOpen));
    }

    /**
     * Apply the active input mode and notify prompts about native keyboard use.
     */
    private applyInputMode(): void {
        if (this.nativeKeyboardSwitch.matches) {
            this.panelOpen = this.keyboardMode === 'app';
            globalThis.dispatchEvent(new CustomEvent('calc-input-mode-change', { detail: { mode: this.keyboardMode } }));
            this.toggle.setAttribute('aria-pressed', String(this.keyboardMode === 'native'));
            this.toggle.dataset.mode = this.keyboardMode;
        } else {
            this.keyboardMode = 'app';
            this.toggle.removeAttribute('aria-pressed');
            delete this.toggle.dataset.mode;
        }

        this.applyPanelState();
        this.setToggleLabel();
    }

    /**
     * Reset the mobile input mode when the responsive breakpoint changes.
     */
    private readonly layoutChange = (): void => {
        if (!this.nativeKeyboardSwitch.matches) {
            this.keyboardMode = 'app';
        }
        this.applyInputMode();
    };

    /**
     * Refresh localized labels after a locale change.
     */
    private readonly setLanguage = (): void => {
        this.setToggleLabel();
    };

    /**
     * Update the keypad toggle title and accessible label for the current mode.
     */
    private setToggleLabel(): void {
        const label =
            this.nativeKeyboardSwitch.matches && this.keyboardMode === 'app'
                ? i18n.page.shell.useNativeKeyboard
                : this.nativeKeyboardSwitch.matches && this.keyboardMode === 'native'
                  ? i18n.page.shell.useAppKeypad
                  : i18n.page.shell.toggleKeypad;
        this.toggle.title = label;
        this.toggle.setAttribute('aria-label', label);
    }

    /**
     * Parse and evaluate one prompt with the shared MathJSLab interpreter.
     */
    private readonly evaluatePrompt = (prompt: CommandPrompt): void => {
        let tree: NodeInput | undefined;
        const { interpreter } = appEngine;
        insertOutput.type = '';
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
            if (insertOutput.type !== '') {
                const output = document.createElement('div');
                const renderOutput = outputFunction[insertOutput.type];
                if (!renderOutput) {
                    throw new Error(`unknown output type: ${insertOutput.type}`);
                }
                output.className = 'plot-output';
                prompt.element.output.append(output);
                renderOutput(output);
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
