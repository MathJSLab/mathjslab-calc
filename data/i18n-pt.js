import licenseText from './i18n-licenseText.js';

export default {
    locale: 'pt',
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    languageName: 'Português',
    app: {
        title: 'MathJSLab Calc',
        description: 'Calculadora científica com prompt',
        noscript: 'O JavaScript deve estar habilitado para executar o MathJSLab Calc.',
    },
    shell: {
        languageLabel: 'Idioma',
        toggleKeypad: 'Mostrar ou ocultar teclado',
        useAppKeypad: 'Usar teclado do aplicativo',
        useNativeKeyboard: 'Usar teclado nativo',
    },
    prompt: {
        ariaLabel: 'Prompt do MathJSLab',
        listAriaLabel: 'Lista de prompts do MathJSLab',
    },
    keypad: {
        ariaLabel: 'Teclado científico',
        panelLabel: 'Painéis do teclado',
        title: 'Científica',
        brand: 'MathJSLab',
        panels: {
            calculator: 'Calculadora',
            functions: 'Funções',
            alphabet: 'Alfabético',
            programming: 'Programação',
        },
        base: {
            label: 'Base',
            options: {
                bin: 'BIN',
                oct: 'OCT',
                dec: 'DEC',
                hex: 'HEX',
            },
        },
        keys: {
            enter: 'Enter',
            delete: 'DEL',
            clear: 'AC',
        },
    },
    licenseTitle: 'Licença MIT',
    licenseLeadPrefixHtml: 'O <strong>MathJSLab</strong> é distribuído como software livre sob a ',
    licenseLinkLabel: 'Licença MIT',
    licenseHref: 'https://opensource.org/license/MIT',
    licenseLeadSuffix: ', permitindo uso, modificação e redistribuição nos termos abaixo.',
    licenseText,
};
