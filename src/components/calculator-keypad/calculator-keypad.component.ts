import styles from './calculator-keypad.styles.scss';
import i18n from '../../i18n.js';
import type WebComponentElement from '../WebComponentElement.js';
import constructorFactory from '../constructorFactory.js';
import createElementFactory from '../createElementFactory.js';
import defineFactory from '../defineFactory.js';
import keyToPostfix from '../keyToPostfix.js';
import setContainerFactory from '../setContainerFactory.js';
import setIdFirstFactory from '../setIdFirstFactory.js';

export interface CalculatorKeypadElementEntry {
    root: HTMLElement;
    title: HTMLElement;
    brand: HTMLElement;
    tabs: HTMLElement;
    keys: HTMLElement;
}

export type CalculatorKeypadElement = WebComponentElement<CalculatorKeypadElementEntry>;
export const CalculatorKeypadElementEntryKey: (keyof CalculatorKeypadElementEntry)[] = ['root', 'title', 'brand', 'tabs', 'keys'] as const;

type PanelId = 'calculator' | 'functions' | 'alphabet';

type KeyDefinition = {
    label: string;
    value?: string;
    action?: 'insert' | 'backspace' | 'clear' | 'evaluate';
    kind?: 'number' | 'operation' | 'command';
    wide?: boolean;
};

type KeyPanel = {
    id: PanelId;
    label: string;
    rows: KeyDefinition[][];
};

const panels: KeyPanel[] = [
    {
        id: 'calculator',
        label: '123',
        rows: [
            [{ label: 'x' }, { label: 'y' }, { label: 'z' }, { label: 'pi', value: 'pi' }, { label: 'e' }],
            [
                { label: '7', kind: 'number' },
                { label: '8', kind: 'number' },
                { label: '9', kind: 'number' },
                { label: '*', kind: 'operation' },
                { label: '/', kind: 'operation' },
            ],
            [
                { label: '4', kind: 'number' },
                { label: '5', kind: 'number' },
                { label: '6', kind: 'number' },
                { label: '+', kind: 'operation' },
                { label: '-', kind: 'operation' },
            ],
            [
                { label: '1', kind: 'number' },
                { label: '2', kind: 'number' },
                { label: '3', kind: 'number' },
                { label: '<', kind: 'operation' },
                { label: '>', kind: 'operation' },
            ],
            [
                { label: '0', kind: 'number' },
                { label: '.', kind: 'number' },
                { label: ',', kind: 'operation' },
                { label: '<=', kind: 'operation' },
                { label: '>=', kind: 'operation' },
            ],
            [
                { label: '(', kind: 'operation' },
                { label: ')', kind: 'operation' },
                { label: '==', kind: 'operation' },
                { label: 'DEL', action: 'backspace', kind: 'command' },
                { label: 'AC', action: 'clear', kind: 'command' },
            ],
            [{ label: 'Enter', action: 'evaluate', kind: 'command', wide: true }],
        ],
    },
    {
        id: 'functions',
        label: 'f(x)',
        rows: [
            [
                { label: 'sin', value: 'sin(' },
                { label: 'cos', value: 'cos(' },
                { label: 'tan', value: 'tan(' },
                { label: 'asin', value: 'asin(' },
                { label: 'acos', value: 'acos(' },
            ],
            [
                { label: 'atan', value: 'atan(' },
                { label: 'sinh', value: 'sinh(' },
                { label: 'cosh', value: 'cosh(' },
                { label: 'tanh', value: 'tanh(' },
                { label: 'sqrt', value: 'sqrt(' },
            ],
            [
                { label: 'root', value: 'root(' },
                { label: 'abs', value: 'abs(' },
                { label: 'arg', value: 'arg(' },
                { label: 'sign', value: 'sign(' },
                { label: 'conj', value: 'conj(' },
            ],
            [
                { label: 'log', value: 'log(' },
                { label: 'log10', value: 'log10(' },
                { label: 'log2', value: 'log2(' },
                { label: 'exp', value: 'exp(' },
                { label: '^', kind: 'operation' },
            ],
            [
                { label: 'det', value: 'det(' },
                { label: 'inv', value: 'inv(' },
                { label: 'trace', value: 'trace(' },
                { label: 'rank', value: 'rank(' },
                { label: 'eye', value: 'eye(' },
            ],
            [
                { label: 'sum', value: 'sum(' },
                { label: 'prod', value: 'prod(' },
                { label: 'mean', value: 'mean(' },
                { label: 'min', value: 'min(' },
                { label: 'max', value: 'max(' },
            ],
            [
                { label: '(', kind: 'operation' },
                { label: ')', kind: 'operation' },
                { label: ',', kind: 'operation' },
                { label: 'DEL', action: 'backspace', kind: 'command' },
                { label: 'Enter', action: 'evaluate', kind: 'command' },
            ],
        ],
    },
    {
        id: 'alphabet',
        label: 'abc',
        rows: [
            ['a', 'b', 'c', 'd', 'e'].map((label) => ({ label })),
            ['f', 'g', 'h', 'i', 'j'].map((label) => ({ label })),
            ['k', 'l', 'm', 'n', 'o'].map((label) => ({ label })),
            ['p', 'q', 'r', 's', 't'].map((label) => ({ label })),
            ['u', 'v', 'w', 'x', 'y'].map((label) => ({ label })),
            [{ label: 'z' }, { label: '_' }, { label: '=' }, { label: ';' }, { label: ':' }],
            [
                { label: 'ans', value: 'ans' },
                { label: 'pi', value: 'pi' },
                { label: 'DEL', action: 'backspace', kind: 'command' },
                { label: 'AC', action: 'clear', kind: 'command' },
                { label: 'Enter', action: 'evaluate', kind: 'command' },
            ],
        ],
    },
];

export class CalculatorKeypad extends HTMLElement {
    public static readonly tagName = 'calculator-keypad';
    public readonly element = {} as CalculatorKeypadElement;
    public static readonly elementFields: (keyof CalculatorKeypadElementEntry)[] = CalculatorKeypadElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(CalculatorKeypadElementEntryKey);
    public static readonly null = null as unknown as CalculatorKeypad;
    public static readonly undefined = undefined as unknown as CalculatorKeypad;
    private activePanel: PanelId = 'calculator';

    public constructor() {
        super();
        constructorFactory(CalculatorKeypad, styles).bind(this)();
        this.renderTabs();
        this.renderKeys();
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

    public setId: (this: CalculatorKeypad, id?: string) => void = setIdFirstFactory(CalculatorKeypad).bind(this);
    public static readonly createElement = createElementFactory(CalculatorKeypad);
    public static readonly define = defineFactory(CalculatorKeypad);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
    }

    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
    }

    private renderTabs(): void {
        for (const panel of panels) {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'tab';
            tab.textContent = panel.label;
            tab.dataset.panel = panel.id;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', `${CalculatorKeypad.tagName}-${panel.id}-panel`);
            tab.addEventListener('click', () => {
                this.activePanel = panel.id;
                this.renderKeys();
            });
            this.element.tabs.append(tab);
        }
    }

    private renderKeys(): void {
        this.element.keys.replaceChildren();
        this.element.keys.id = `${CalculatorKeypad.tagName}-${this.activePanel}-panel`;
        this.element.keys.setAttribute('role', 'tabpanel');
        this.element.keys.setAttribute('aria-label', panels.find((panel) => panel.id === this.activePanel)!.label);
        this.updateTabs();

        const panel = panels.find((candidate) => candidate.id === this.activePanel)!;
        for (const key of panel.rows.flat()) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = this.getKeyLabel(key);
            button.className = 'key';
            button.dataset.kind = key.kind || 'operation';
            if (key.wide) {
                button.dataset.wide = 'true';
            }
            button.addEventListener('click', () => {
                this.dispatchEvent(
                    new CustomEvent('calculator-key', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            action: key.action || 'insert',
                            value: key.value || key.label,
                        },
                    }),
                );
            });
            this.element.keys.append(button);
        }
    }

    private updateTabs(): void {
        for (const tab of this.element.tabs.querySelectorAll<HTMLButtonElement>('.tab')) {
            const selected = tab.dataset.panel === this.activePanel;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        }
    }

    private readonly setLanguage = (): void => {
        this.element.root.setAttribute('aria-label', i18n.page.keypad.ariaLabel);
        this.element.tabs.setAttribute('aria-label', i18n.page.keypad.panelLabel);
        this.element.title.textContent = i18n.page.keypad.title;
        this.element.brand.textContent = i18n.page.keypad.brand;
        for (const tab of this.element.tabs.querySelectorAll<HTMLButtonElement>('.tab')) {
            const panel = panels.find((candidate) => candidate.id === tab.dataset.panel);
            if (panel) {
                tab.title = i18n.page.keypad.panels[panel.id];
            }
        }
        this.renderKeys();
    };

    private getKeyLabel(key: KeyDefinition): string {
        if (key.action === 'evaluate') {
            return i18n.page.keypad.keys.enter;
        }
        if (key.action === 'backspace') {
            return i18n.page.keypad.keys.delete;
        }
        if (key.action === 'clear') {
            return i18n.page.keypad.keys.clear;
        }
        return key.label;
    }
}

CalculatorKeypad.define();
