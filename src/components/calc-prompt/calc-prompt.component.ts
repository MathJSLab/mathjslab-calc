import styles from './calc-prompt.styles.scss';
import { ComponentElement } from '../ComponentElement.js';

type CalcPromptElements = {
  root: HTMLElement;
  input: HTMLTextAreaElement;
  output: HTMLOutputElement;
};

export class CalcPrompt extends ComponentElement<CalcPromptElements> {
  public static readonly tagName = 'calc-prompt';

  public constructor() {
    super();
    this.mountTemplate(CalcPrompt.tagName, ['root', 'input', 'output'], styles);
  }

  public connectedCallback(): void {
    this.element.input.addEventListener('input', this.resize);
    this.element.input.addEventListener('keydown', this.keydown);
    this.resize();
  }

  public disconnectedCallback(): void {
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
}

customElements.define(CalcPrompt.tagName, CalcPrompt);
