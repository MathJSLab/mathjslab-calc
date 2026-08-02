import { Interpreter } from 'mathjslab';
import type { AliasNameTable } from 'mathjslab/lib/types/AST';
import type { InterpreterConfig } from 'mathjslab/lib/types/Interpreter';
import { appEngine } from './appEngine';
import buildConfiguration from './build-configuration.json';
import i18n, { type Locale } from './i18n';

/**
 * Language-aware aliases passed to MathJSLab's parser and lexer context.
 */
export const languageAlias: Record<Locale, AliasNameTable> = {
    en: {
        abs: /^abs(olute)?$/,
        arg: /^arg(ument)?$|^angle$/,
        sign: /^sign(al)?$|^sgn$/,
        conj: /^conj(ugate)?$/,
        sqrt: /^sq(uare)?r(oo)?t$/,
        root: /^r(oo)?t$/,
        power: /^pow(er)?$/,
        exp: /^exp(onential)?$/,
        log: /^ln$/,
        log10: /^l((og)?arithm)10$/,
        asin: /^a(rc)?sine?$/,
        sin: /^sin$/,
        acos: /^a(rc)?cos(ine)?$/,
        cos: /^cos(ine)?$/,
        atan: /^a(rc)?tan(gent)?$/,
        tan: /^tan(gent)?$/,
        asinh: /^a(rea)?sine?h(((yp)?erb)?olic)?$/,
        sinh: /^sine?h(((yp)?erb)?olic)?$/,
        acosh: /^a(rea)?cos(ine)?h(((yp)?erb)?olic)?$/,
        cosh: /^cos(ine)?h(((yp)?erb)?olic)?$/,
        atanh: /^a(rea)?tan(gent)?h(((yp)?erb)?olic)?$/,
        tanh: /^tan(gent)?h(((yp)?erb)?olic)?$/,
        factorial: /^fact(orial)?$/,
        eye: /^ident(ity)?$/,
        inv: /^inv(erse)?$/,
        det: /^det(erminant)?$/,
        trace: /^tr(ace)?$/,
        ctranspose: /^trans(p((ose)?)?)?$/,
        min: /^min(imum)?$/,
        max: /^max(imum)?$/,
        mean: /^mean|avg|average$/,
    },
    es: {
        abs: /^abs(olut(o|e))?$/,
        arg: /^arg(ument(o)?)?$|^ang(ulo|le)$/,
        sign: /^sign(o|al)?$|^sgn$/,
        conj: /^conj(uga(do|te)?)?$/,
        sqrt: /^r(ai)?z(2|cuadrada)?$|^sqrt$/,
        root: /^r(ai)?z$|^r(oo)?t$/,
        power: /^pot(encia)?$|^pow(er)?$/,
        exp: /^exp(onencial|onential)?$/,
        log: /^ln$/,
        log10: /^l((og)?aritmo)10$/,
        asin: /^a(rc)?s[ei]n(o)?$/,
        sin: /^s[ei]n(o)?$/,
        acos: /^a(rc)?cos(eno)?$/,
        cos: /^cos(eno)?$/,
        atan: /^a(rc)?t(g|an)(gente)?$/,
        tan: /^t(g|an)(gente)?$/,
        asinh: /^a(rc)?s[ei]nh$/,
        sinh: /^s[ei]nh$/,
        acosh: /^a(rc)?cosh$/,
        cosh: /^cosh$/,
        atanh: /^a(rc)?t(g|an)h$/,
        tanh: /^t(g|an)h$/,
        factorial: /^fact(orial)?$/,
        eye: /^ident(i(dad|ty))?$|^eye$/,
        inv: /^inv(er(s[ao]|tir)?)?$/,
        det: /^det(erminant(e)?)?$/,
        trace: /^tr(aza|ace)$/,
        ctranspose: /^trans(p((ose)?|(uesta)?))?$/,
        min: /^min(imo)?$|^min(imum)?$/,
        max: /^max(imo)?$|^max(imum)?$/,
        mean: /^media|mean$/,
    },
    pt: {
        abs: /^abs(olut(o|e))?$/,
        arg: /^arg(ument(o)?)?$|^angle$|^angulo$/,
        sign: /^sign(al)?$|^sinal$|^sgn$/,
        conj: /^conj(uga(do|te)?)?$/,
        sqrt: /^r(ai)?z(2|q(uadrada)?)$|^sqrt$/,
        root: /^r(ai)?z$|^r(oo)?t$/,
        power: /^pot(encia)?$|^elev(ado)?$|^pow(er)?$/,
        exp: /^exp(onen((cial)|(tial)))?$/,
        log: /^ln$/,
        log10: /^l((og)?aritmo)10$/,
        asin: /^a(rc)?s[ei]n$/,
        sin: /^s[ei]n$/,
        acos: /^a(rc)?cos$/,
        cos: /^cos$/,
        atan: /^a(rc)?t(g|an)$/,
        tan: /^t(g|an)$/,
        asinh: /^a(rc)?s[ei]nh$/,
        sinh: /^s[ei]nh$/,
        acosh: /^a(rc)?cosh$/,
        cosh: /^cosh$/,
        atanh: /^a(rc)?t(g|an)h$/,
        tanh: /^t(g|an)h$/,
        factorial: /^fa(c)?t(orial)?$/,
        eye: /^ident(i(dade|ty))?$|^eye$/,
        inv: /^inv(er(t(er)?|s[ea])?)?$/,
        det: /^det(erminant(e)?)?$/,
        trace: /^tr(aco|ace)$/,
        ctranspose: /^trans(p((ose)?|(osta)?))?$/,
        min: /^min(imo)?$|^min(imum)?$/,
        max: /^max(imo)?$|^max(imum)?$/,
        mean: /^media|mean$/,
    },
};

/**
 * Interpreter creation options shared by the application.
 */
export const InterpreterConfiguration: InterpreterConfig = {
    aliasNameTable: languageAlias[i18n.locale],
};

/**
 * Minimal structural type for updating aliases on an existing interpreter.
 */
type InterpreterWithContext = {
    context?: {
        setAliasNameTable: (aliasNameTable?: AliasNameTable) => void;
    };
};

/**
 * Keep the shared interpreter context aligned with the current UI locale.
 */
const syncLanguage = (): void => {
    appEngine.lang = i18n.locale;
    InterpreterConfiguration.aliasNameTable = languageAlias[i18n.locale];
    (appEngine.interpreter as InterpreterWithContext).context?.setAliasNameTable(InterpreterConfiguration.aliasNameTable);
};

/**
 * Public language switch used by UI controls and integrations.
 */
appEngine.setLanguage = (lang?: string): void => {
    i18n.setLocale(lang);
};

i18n.addEventListener('languagechange', syncLanguage);

/**
 * Initialize the interpreter service shared by the calculator shell.
 */
const bootstrapInterpreter = (): void => {
    if (typeof appEngine.config.defaultLanguage === 'undefined' || appEngine.config.defaultLanguage === null) {
        appEngine.config.defaultLanguage = i18n.locale;
    }
    appEngine.setLanguage(appEngine.config.defaultLanguage);
    appEngine.lang = i18n.locale;
    InterpreterConfiguration.aliasNameTable = languageAlias[i18n.locale];
    appEngine.interpreter = Interpreter.Create(InterpreterConfiguration);
    appEngine.interpreter.debug = buildConfiguration.debug;
    appEngine.buildMessage = buildConfiguration.buildMessage;
};

bootstrapInterpreter();

export { bootstrapInterpreter };
