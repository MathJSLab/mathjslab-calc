import './InterpreterConfiguration';
import './components/components';
import { appEngine } from './appEngine';
import { CalculatorController } from './calculatorController';
import type { ApplicationWrapper } from './components/application-wrapper/application-wrapper.component';
import type { CommandPromptList } from './components/command-prompt-list/command-prompt-list.component';
import './main.scss';

/**
 * Initialize the Web Component application shell.
 */
function bootstrap(): void {
    const shell = document.querySelector<ApplicationWrapper>('application-wrapper');
    if (shell) {
        appEngine.shell = shell as typeof appEngine.shell;
    }
    const prompts = document.getElementById('calc-prompts') as CommandPromptList | null;
    if (prompts) {
        new CalculatorController(prompts).connect();
    }
}

bootstrap();

export { bootstrap };
