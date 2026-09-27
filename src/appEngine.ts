import { Interpreter } from 'mathjslab';
import { RemoteMathJSLabRuntime, type MathJSLabRuntime, type RuntimeWorkerEndpoint } from 'mathjslab/runtime';
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
    runtime: MathJSLabRuntime;
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
    runtime: new RemoteMathJSLabRuntime(
        () => new Worker(new URL('./mathjslab.worker.ts', import.meta.url), { type: 'module', name: 'mathjslab-runtime-worker' }) as unknown as RuntimeWorkerEndpoint,
    ),
    shell: null as unknown as ApplicationWrapper,
};

(globalThis as any).appEngine = appEngine;
(globalThis as any).appConfiguration = appConfiguration;

export type { AppConfiguration, AppEngine };
export { Interpreter, appConfiguration, appEngine };
export default { Interpreter, appConfiguration, appEngine };
