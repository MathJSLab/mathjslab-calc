import { Interpreter, type NodeInput } from 'mathjslab';
import styles from './calc-shell.styles.scss';
import buildConfiguration from '../../build-configuration.json' with { type: 'json' };
import { ComponentElement } from '../ComponentElement.js';
import { CalcPrompt } from '../calc-prompt/calc-prompt.component.js';
import { CalcPromptList } from '../calc-prompt-list/calc-prompt-list.component.js';

type CalcShellElements = {
  root: HTMLElement;
  workspace: HTMLElement;
  toggle: HTMLButtonElement;
  prompts: CalcPromptList;
  panel: HTMLElement;
  keypad: HTMLElement;
};

type CalculatorKeyEvent = CustomEvent<{
  action: 'insert' | 'backspace' | 'clear' | 'evaluate';
  value: string;
}>;

export class CalcShell extends ComponentElement<CalcShellElements> {
  public static readonly tagName = 'calc-shell';
  private readonly interpreter = Interpreter.Create({});
  private panelOpen = true;

  public constructor() {
    super();
    this.mountTemplate(CalcShell.tagName, ['root', 'workspace', 'toggle', 'prompts', 'panel', 'keypad'], styles);
    this.interpreter.debug = buildConfiguration.debug;
    this.element.prompts.evaluator = this.evaluatePrompt;
  }

  public connectedCallback(): void {
    this.element.toggle.addEventListener('click', this.togglePanel);
    this.addEventListener('calculator-key', this.keyInput as EventListener);
  }

  public disconnectedCallback(): void {
    this.element.toggle.removeEventListener('click', this.togglePanel);
    this.removeEventListener('calculator-key', this.keyInput as EventListener);
  }

  private readonly togglePanel = (): void => {
    this.panelOpen = !this.panelOpen;
    this.element.workspace.dataset.panel = this.panelOpen ? 'open' : 'closed';
    this.element.toggle.setAttribute('aria-expanded', String(this.panelOpen));
    this.element.prompts.insertText('');
  };

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

  private readonly evaluatePrompt = (prompt: CalcPrompt): void => {
    let tree: NodeInput | undefined;
    try {
      tree = this.interpreter.Parse(prompt.value);
      const evaluated = this.interpreter.Evaluate(tree);
      const inputText = this.interpreter.Unparse(tree);
      const resultText = this.interpreter.Unparse(evaluated);
      const inputMath = this.interpreter.UnparseMathML(tree);
      const resultMath = this.interpreter.UnparseMathML(evaluated);

      if (inputText === resultText) {
        prompt.setOutput(`<table><tr><td>${inputMath}</td></tr></table>`);
      } else {
        prompt.setOutput(
          `<table><tr><td>${inputMath}</td><td><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mo>=</mo></math></td><td>${resultMath}</td></tr></table>`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const parsedInput = tree ? `<table><tr><td>${this.interpreter.UnparseMathML(tree)}</td></tr></table>` : '';
      prompt.setOutput(`${parsedInput}<pre class="error">${message}</pre>`);
      if (this.interpreter.debug) {
        throw error;
      }
    }
  };
}

customElements.define(CalcShell.tagName, CalcShell);
