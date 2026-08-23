import licenseText from './i18n-licenseText.js';

export default {
    locale: 'es',
    htmlLang: 'es',
    ogLocale: 'es_ES',
    languageName: 'Español',
    app: {
        title: 'MathJSLab Calc',
        description: 'Calculadora científica con prompt',
        noscript: 'JavaScript debe estar habilitado para ejecutar MathJSLab Calc.',
    },
    shell: {
        languageLabel: 'Idioma',
        toggleKeypad: 'Mostrar u ocultar teclado',
        useAppKeypad: 'Usar teclado de la app',
        useNativeKeyboard: 'Usar teclado nativo',
    },
    prompt: {
        ariaLabel: 'Prompt de MathJSLab',
        listAriaLabel: 'Lista de prompts de MathJSLab',
    },
    keypad: {
        ariaLabel: 'Teclado científico',
        panelLabel: 'Paneles del teclado',
        title: 'Científica',
        brand: 'MathJSLab',
        panels: {
            calculator: 'Calculadora',
            functions: 'Funciones',
            alphabet: 'Alfabético',
            programming: 'Programación',
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
            enter: 'Intro',
            delete: 'DEL',
            clear: 'AC',
        },
    },
    licenseTitle: 'Licencia MIT',
    licenseLeadPrefixHtml: '<strong>MathJSLab</strong> se distribuye como software libre bajo la ',
    licenseLinkLabel: 'Licencia MIT',
    licenseHref: 'https://opensource.org/license/MIT',
    licenseLeadSuffix: ', permitiendo uso, modificación y redistribución según los términos siguientes.',
    licenseText,
};
