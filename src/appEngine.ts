import { Interpreter } from 'mathjslab';
import type { ApplicationWrapper } from './components/application-wrapper/application-wrapper.component';

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
    shell: ApplicationWrapper;
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
    shell: null as unknown as ApplicationWrapper,
};

(globalThis as any).appEngine = appEngine;
(globalThis as any).appConfiguration = appConfiguration;

export type { AppConfiguration, AppEngine };
export { Interpreter, appConfiguration, appEngine };
export default { Interpreter, appConfiguration, appEngine };
