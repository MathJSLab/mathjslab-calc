import styles from './calc-prompt-list.styles.scss';
import { ComponentElement } from '../ComponentElement.js';
import { CalcPrompt } from '../calc-prompt/calc-prompt.component.js';

type CalcPromptListElements = {
  root: HTMLElement;
};

export type PromptEvaluator = (prompt: CalcPrompt) => void;

export class CalcPromptList extends ComponentElement<CalcPromptListElements> {
  public static readonly tagName = 'calc-prompt-list';
  public evaluator: PromptEvaluator = () => {};
  private activePrompt: CalcPrompt | null = null;

  public constructor() {
    super();
    this.mountTemplate(CalcPromptList.tagName, ['root'], styles);
  }

  public connectedCallback(): void {
    this.addEventListener('calc-prompt-evaluate', this.evaluateEvent as EventListener);
    if (!this.activePrompt) {
      this.appendPrompt();
    }
  }

  public disconnectedCallback(): void {
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
}

customElements.define(CalcPromptList.tagName, CalcPromptList);
