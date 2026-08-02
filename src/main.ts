import './InterpreterConfiguration';
import './components/components';
import { appEngine } from './appEngine';
import './main.scss';

/**
 * Initialize the Web Component application shell.
 */
function bootstrap(): void {
    const shell = document.querySelector('calc-shell');
    if (shell) {
        appEngine.shell = shell as typeof appEngine.shell;
    }
}

bootstrap();

export { bootstrap };
