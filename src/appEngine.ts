import { Interpreter } from 'mathjslab';
import type { CalcShell } from './components/calc-shell/calc-shell.component';

type MathJSLabInterpreter = ReturnType<typeof Interpreter.Create>;

/**
 * Runtime configuration values injected by the page or build output.
 */
type AppConfiguration = {
    defaultLanguage?: string;
};

/**
 * Shared application state used by UI components and MathJSLab services.
 */
type AppEngine = {
    config: AppConfiguration;
    lang: string;
    setLanguage: (lang?: string) => void;
    buildMessage: string;
    interpreter: MathJSLabInterpreter;
    shell: CalcShell;
};

const appConfiguration: AppConfiguration = {};

/**
 * Global application engine instance exposed for browser integrations.
 */
const appEngine: AppEngine = {
    config: appConfiguration,
    lang: '',
    setLanguage: () => {},
    buildMessage: '',
    interpreter: null as unknown as MathJSLabInterpreter,
    shell: null as unknown as CalcShell,
};

(globalThis as any).appEngine = appEngine;
(globalThis as any).appConfiguration = appConfiguration;

export type { AppConfiguration, AppEngine };
export { Interpreter, appConfiguration, appEngine };
export default { Interpreter, appConfiguration, appEngine };
