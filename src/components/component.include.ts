import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import components from './component.include.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = `\n${components.include
  .map((component) => fs.readFileSync(path.join(__dirname, component, `${component}.template.html`), 'utf-8'))
  .join('\n')}\n`;

fs.writeFileSync(
  path.join(__dirname, 'components.ts'),
  `/* Web components. File generated at ${new Date().toUTCString()}. */\n${components.include
    .map((component) => `export * from './${component}/${component}.component.js';`)
    .join('\n')}\n`,
);

export { components, templates };
