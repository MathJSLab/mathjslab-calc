/**
 * eslint.config.cjs: ESLint configuration.
 */

const path = require('node:path');
const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');

console.log(`Running project lint (configuration: ${path.basename(__filename)}) ...`);

const basePlugins = {
    import: importPlugin,
    prettier: prettierPlugin,
};

const prettierRules = {
    ...prettierPlugin.configs.recommended.rules,
    ...eslintConfigPrettier.rules,
};

const tsPluginConfigRules = {
    ...tsPlugin.configs['eslint-recommended'].rules,
    ...tsPlugin.configs['recommended'].rules,
};

module.exports = [
    {
        ignores: ['dist/**', 'node_modules/**', 'script/build/**', '*.min.*'],
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: 'tsconfig.build.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
                globals: {
                    ...globals.es2015,
                },
            },
        },
        plugins: {
            ...basePlugins,
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPluginConfigRules,
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'no-console': 'warn',
            ...prettierRules,
        },
    },
    {
        files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                globals: globals.es2015,
            },
        },
        plugins: basePlugins,
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            ...prettierRules,
        },
    },
    {
        files: ['script/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: path.join(__dirname, 'script'),
                sourceType: 'module',
                globals: {
                    ...globals.es2015,
                },
            },
        },
        plugins: {
            ...basePlugins,
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPluginConfigRules,
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'no-console': 'off',
            ...prettierRules,
        },
    },
];
