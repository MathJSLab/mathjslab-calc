import licenseText from './i18n-licenseText.js';

export default {
    locale: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
    languageName: 'English',
    app: {
        title: 'MathJSLab Calc',
        description: 'Scientific prompt calculator',
        noscript: 'JavaScript must be enabled to run MathJSLab Calc.',
    },
    shell: {
        languageLabel: 'Language',
        toggleKeypad: 'Toggle keypad',
        useAppKeypad: 'Use app keypad',
        useNativeKeyboard: 'Use native keyboard',
    },
    prompt: {
        ariaLabel: 'MathJSLab prompt',
        listAriaLabel: 'MathJSLab prompt list',
    },
    keypad: {
        ariaLabel: 'Scientific keypad',
        panelLabel: 'Keypad panels',
        title: 'Scientific',
        brand: 'MathJSLab',
        panels: {
            calculator: 'Calculator',
            functions: 'Functions',
            alphabet: 'Alphabet',
            programming: 'Programming',
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
    licenseTitle: 'MIT License',
    licenseLeadPrefixHtml: '<strong>MathJSLab</strong> is distributed as free software under the ',
    licenseLinkLabel: 'MIT License',
    licenseHref: 'https://opensource.org/license/MIT',
    licenseLeadSuffix: ', allowing use, modification and redistribution under the terms below.',
    licenseText,
};
