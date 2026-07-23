/**
 * component.include.ts: Component inclusion engine.
 * Uses: component.include.json
 * This script loads templates used in project, at `template` and `templateString`, and generates `components.ts` file (to be imported by project).
 * This script is used at build time (in `webpack.config.ts`).
 */

import fs from 'node:fs';
import path from 'node:path';
import components from './component.include.json';

/* eslint-disable-next-line  no-console */
console.log('Loading Web components ...');
const templates = '\n' + components.include.map((component) => fs.readFileSync(path.join(__dirname, component, component + '.template.html'), 'utf-8')).join('\n') + '\n';
fs.writeFileSync(
    path.join(__dirname, 'components.ts'),
    `/* Web components. File generated at ${new Date().toUTCString()}. */\n` +
        `${components.include.map((component) => `export * from './${component}/${component}.component';`).join('\n')}\n`,
);
export { components, templates };
export default { components, templates };
/* eslint-disable-next-line  no-console */
console.log('Loading Web components done.');
