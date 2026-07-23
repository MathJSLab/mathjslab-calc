/**
 * EleventyUtil.mjs
 * ================
 *
 * This file contains useful tools for building projects with templates using
 * Eleventy (`@11ty/eleventy`). It implements, in addition to useful functions
 * in the Eleventy configuration, extensions for rendering SASS and
 * CoffeeScript templates, engines for parsing the front matter in YAML,
 * CoffeeScript and TOML languages, and also contains useful functions for
 * transforming images using the `@11ty/eleventy-img` package.
 *
 * These tools were designed for use at build time in projects with Eleventy.
 *
 * # Source file dependencies (in this directory):
 *  - readFileBom.ts
 *  - readFileBomSync.ts
 * TypeScript files are built in the script/build/ directory. These built
 * files (JavaScript) are in the script/build/helper/ directory.
 *
 * # Package dependencies
 *
 * Install development dependencies with:
 *
 * ```
 * npm install --save-dev uuid chalk @11ty/eleventy @11ty/eleventy-img yaml json5 smol-toml sass coffeescript cson png-to-ico
 * ```
 *
 * MIT License, Copyright (c) 2016-2026 Sergio Lindau, mathjslab.com
 */

/**
 * @module EleventyUtil
 */

import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { v4 as uuid } from 'uuid';
import chalk from 'chalk';
import Eleventy, { EleventyRenderPlugin } from '@11ty/eleventy';
import Image from '@11ty/eleventy-img';
import Nunjucks from 'nunjucks';
// import markdownIt from 'markdown-it';
import JSON5 from 'json5';
import YAML from 'yaml';
import TOML from 'smol-toml';
import CSON from 'cson';
import CoffeeScript from 'coffeescript';
import * as sass from 'sass';
import { DateTime } from 'luxon';

/**
 * Useful functions for listing and reading files.
 */
import readFileBom from '../build/helper/readFileBom.js';
import readFileBomSync from '../build/helper/readFileBomSync.js';
import toIco from '../build/helper/toIco.js';

/**
 * Overrides the platform's default line break format with the Microsoft
 * Windows format (CRLF). This is done because otherwise it would be done when
 * pushing to the GitHub repository and throws warnings.
 */
Object.defineProperty(os, 'EOL', {
    value: '\r\n',
    writable: false,
});

/**
 * Backup, extend and overriding JSON object functions with `json5` package.
 * The `JSON.stringify` function is not overridden because its equivalent from
 * the `json5` package does not produce double-quoted keys.
 */
globalThis.JSON.backup = {
    parse: globalThis.JSON.parse.bind(globalThis.JSON),
    stringify: globalThis.JSON.stringify.bind(globalThis.JSON),
};
/* Extending JSON object. */
globalThis.JSON.parseJSON5 = JSON5.parse.bind(JSON5);
globalThis.JSON.parseJSON = globalThis.JSON.parse.bind(globalThis.JSON);
globalThis.JSON.stringifyJSON5 = JSON5.stringify.bind(JSON5);
globalThis.JSON.stringifyJSON = globalThis.JSON.stringify.bind(globalThis.JSON);
globalThis.JSON.stringify = function (value, replacer, space) {
    return globalThis.JSON.backup.stringify(value, replacer, space).replace(/\n/g, '\r\n');
}.bind(globalThis.JSON);
/* Override JSON.parse function. */
globalThis.JSON.parse = JSON5.parse.bind(JSON5);
/* Extending global JSON object to parse and save files. */
globalThis.JSON.parseFileSync = function (filePath, reviver = null) {
    return JSON5.parse(readFileBomSync(filePath, 'utf-8'), reviver);
};
globalThis.JSON.parseFile = async function (filePath, reviver = null, callback) {
    return JSON5.parse(readFileBom(filePath, 'utf-8'), reviver, callback);
};
globalThis.JSON.saveFileSync = function (value, filePath, replacer, space, options) {
    fs.writeFileSync(filePath, globalThis.JSON.backup.stringify(value, replacer, space).replace(/\n/g, '\r\n'), options);
};
globalThis.JSON.saveFile = async function (value, filePath, replacer, space, options) {
    fs.writeFile(filePath, globalThis.JSON.backup.stringify(value, replacer, space).replace(/\n/g, '\r\n'), options);
};

/**
 * Default template extensions and their aliases. The first element of the array is the default extension and others are aliases.
 */
const templateExtension = {
    HTML: ['html', 'htm', 'xhtml', 'shtml'],
    Markdown: ['md', 'markdown', 'txt', 'mkd', 'mdown'],
    WebC: ['webc'],
    JavaScript: ['11ty.js', 'js', 'cjs', 'mjs'],
    JSON: ['json', 'jsonc', 'geojson', 'topojson'],
    Liquid: ['liquid', 'liquify'],
    Nunjucks: ['njk', 'nunj', 'nunjucks'],
    Handlebars: ['hbs', 'handlebars', 'hbs.html'],
    Mustache: ['mustache', 'mustach'],
    EJS: ['ejs', 'ejs.html'],
    Haml: ['haml', 'hamlc'],
    Pug: ['pug', 'jade'],
    TypeScript: ['ts', 'tsx'],
    JSX: ['jsx', 'jsx.js'],
    MDX: ['mdx', 'mdjsx'],
    CoffeeScript: ['coffee', 'cs', 'cjsx'],
    CSON: ['cson', 'csn'],
    SASS: ['scss', 'sass'],
};
/**
 * Template format aliases.
 */
const templateFormatAlias = {
    html: 'HTML',
    htm: 'HTML',
    xhtml: 'HTML',
    shtml: 'HTML',
    HTML: 'HTML',
    md: 'Markdown',
    markdown: 'Markdown',
    txt: 'Markdown',
    mkd: 'Markdown',
    mdown: 'Markdown',
    Markdown: 'Markdown',
    webc: 'WebC',
    WebC: 'WebC',
    '11ty.js': 'JavaScript',
    js: 'JavaScript',
    cjs: 'JavaScript',
    mjs: 'JavaScript',
    javascript: 'JavaScript',
    JavaScript: 'JavaScript',
    json: 'JSON',
    jsonc: 'JSON',
    geojson: 'JSON',
    topojson: 'JSON',
    JSON: 'JSON',
    JSONC: 'JSON',
    liquid: 'Liquid',
    liquify: 'Liquid',
    Liquid: 'Liquid',
    njk: 'Nunjucks',
    nunj: 'Nunjucks',
    nunjucks: 'Nunjucks',
    Nunjucks: 'Nunjucks',
    hbs: 'Handlebars',
    handlebars: 'Handlebars',
    'hbs.html': 'Handlebars',
    Handlebars: 'Handlebars',
    mustache: 'Mustache',
    mustach: 'Mustache',
    Mustache: 'Mustache',
    ejs: 'EJS',
    'ejs.html': 'EJS',
    EJS: 'EJS',
    haml: 'Haml',
    hamlc: 'Haml',
    Haml: 'Haml',
    pug: 'Pug',
    jade: 'Pug',
    Pug: 'Pug',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    typescript: 'TypeScript',
    TypeScript: 'TypeScript',
    jsx: 'JSX',
    'jsx.js': 'JSX',
    JSX: 'JSX',
    mdx: 'MDX',
    mdjsx: 'MDX',
    MDX: 'MDX',
    coffee: 'CoffeeScript',
    cs: 'CoffeeScript',
    cjsx: 'CoffeeScript',
    coffeescript: 'CoffeeScript',
    CoffeeScript: 'CoffeeScript',
    cson: 'CSON',
    csn: 'CSON',
    CSON: 'CSON',
    scss: 'SASS',
    sass: 'SASS',
    SCSS: 'SASS',
    SASS: 'SASS',
};
/**
 * Default project directories. The `data` and `includes` directories are at
 * the project root. This is so that multiple input directories can reference
 * a single data and includes directory in a multi-step build. The output
 * directory is at project root.
 */
const defaultDirectories = {
    input: './input',
    data: '../data',
    includes: '../includes',
    layouts: './layouts',
    output: './',
};

/**
 * Default eleventy configuration options.
 */
const defaultEleventyOptions = {
    dir: defaultDirectories,
    htmlTemplateEngine: templateExtension.Nunjucks[0],
    markdownTemplateEngine: templateExtension.Nunjucks[0],
    dataTemplateEngine: templateExtension.Nunjucks[0],
    templateFormats: [templateExtension.Nunjucks[0]],
};

/**
 * The following Definitions create a version of the `console` object to emit
 * log, warn, error, and debug messages with the Eleventy prefix and colors.
 */
/**
 * Console prefix object factory.
 * @param {*} prefix
 * @param {*} color
 * @returns
 */
function consolePrefixFactory(prefix = '[11ty]', color = 'gray') {
    const consolePrefix = { prefix, color, indentation: undefined, colored: undefined };
    consolePrefix.indentation = ' '.repeat(consolePrefix.prefix.length);
    consolePrefix.colored = chalk[consolePrefix.color](consolePrefix.prefix);
    return consolePrefix;
}
/**
 * Console prefix object.
 */
const consolePrefix = consolePrefixFactory();
/**
 * Console log functions factory.
 * @param {Object} options
 * @returns A log function.
 */
function logFactory(options = { type: 'log', prefix: consolePrefix.colored, color: 'white', logPrefix: '' }) {
    let { type, prefix, logPrefix, color } = options;
    type = type || 'log';
    logPrefix = logPrefix || '';
    prefix = prefix || consolePrefix.colored;
    prefix = logPrefix ? prefix + ' ' + chalk[color](logPrefix) : prefix;
    color = color || 'white';
    if (typeof type === 'string' && typeof prefix === 'string' && typeof color === 'string' && typeof logPrefix === 'string') {
        return function (...args) {
            const t = type,
                p = prefix,
                c = color;
            globalThis.console[t](
                p,
                ...args.map(function (arg) {
                    return chalk[c](arg);
                }),
            );
            return;
        }.bind(globalThis.console);
    } else {
        throw new Error('logFactory: invalid options:\n' + util.inspect(options, { compact: false, colors: true }));
    }
}
/**
 * The following object replaces the default `console` object in a local scope.
 */
const console = {
    prefix: consolePrefix,
    logFactory,
    log: logFactory({ type: 'log', color: 'green' }),
    warn: logFactory({ type: 'warn', logPrefix: 'Warning:', color: 'yellow' }),
    error: logFactory({ type: 'error', logPrefix: 'Error:', color: 'red' }),
    debug: logFactory({ type: 'debug', color: 'white' }),
    table: globalThis.console.table.bind(globalThis.console),
};

/**
 * This is the engines available to parse front matter of templates. The
 * Eleventy sets a `jsLegacy` engine with
 * require('gray-matter').engines.javascript and sets `javascript` engine
 * by your own.
 */
const parseEngine = {
    yaml: {
        parse: YAML.parse.bind(YAML),
        stringify: YAML.stringify.bind(YAML),
    },
    json: {
        parse: JSON5.parse.bind(JSON5),
        stringify: function (obj, options) {
            const opts = Object.assign({ replacer: null, space: 2 }, options);
            return JSON.stringify(obj, opts.replacer, opts.space);
        },
    },
    coffee: {
        parse: CoffeeScript.compile.bind(CoffeeScript),
        stringify: function () {
            throw new Error('stringifying CoffeeScript is not supported');
        },
    },
    cson: {
        parse: CSON.parse.bind(CSON),
        stringify: CSON.stringify.bind(CSON),
    },
    toml: {
        parse: TOML.parse.bind(TOML),
        stringify: TOML.stringify.bind(TOML),
    },
};
/**
 * Parse options argument to retrieve front matter parse engines to add to configuration.
 * @param {*} options
 * @returns
 */
function frontMatterOptionEngines(options = {}) {
    let engines = {};
    for (const [name, engine] of Object.entries(parseEngine)) {
        engines[name] = Object.assign({}, engine);
    }
    if (options && typeof options === 'object' && (options.engines || options.parsers)) {
        engines = Object.assign(engines, options.parsers, options.engines);
    }
    return { engines };
}
/**
 * Default front matter templates language.
 */
const defaultFrontMatterLanguage = 'yaml';
/**
 * Parse options argument to retrieve front matter language to add to configuration.
 * @param {*} options
 * @returns
 */
function frontMatterOptionLanguage(options = { language: defaultFrontMatterLanguage }) {
    if (options) {
        let language;
        if (typeof options === 'object') {
            language = options.language || options.lang || defaultFrontMatterLanguage;
        } else if (typeof options === 'string') {
            language = options || defaultFrontMatterLanguage;
        } else {
            throw new Error('frontMatterOptionLanguage: invalid options: ' + util.inspect(options, { compact: true, colors: true }));
        }
        if (typeof language !== 'string') {
            throw new Error('frontMatterOptionLanguage: invalid language: ' + util.inspect(language, { compact: true, colors: true }));
        }
        language = language.toLowerCase().trim();
        switch (language) {
            case 'node':
            case 'javascript':
            case 'js':
                return { language: 'javascript' };
            case 'legacy':
            case 'jslegacy':
                return { language: 'jsLegacy' };
            case 'coffee':
            case 'coffeescript':
            case 'cs':
                return { language: 'coffee' };
            case 'cson':
            case 'coffee-json':
            case 'coffeejson':
            case 'coffee-obj':
            case 'coffeeobj':
            case 'csobj':
                return { language: 'cson' };
            case defaultFrontMatterLanguage:
            case 'yml':
                return {};
            default:
                return { language };
        }
    } else {
        return {};
    }
}
/**
 * Default front matter delimiter.
 */
const defaultFrontMatterDelimiter = '---';
/**
 * Parse options argument to retrieve front matter delimiters to add to configuration.
 * @param {*} options
 * @returns
 */
function frontMatterOptionDelimiters(options = { delimiters: defaultFrontMatterDelimiter }) {
    if (options) {
        let delimiters;
        if (Array.isArray(options)) {
            delimiters = options;
        } else if (typeof options === 'object') {
            delimiters = options.delims || options.delimiters || [defaultFrontMatterDelimiter, defaultFrontMatterDelimiter];
        } else if (typeof options === 'string') {
            delimiters = [options, options];
        } else {
            throw new Error('invalid options: ' + util.inspect(options, { compact: true, colors: true }));
        }
        delimiters = Array.isArray(delimiters) ? delimiters : [delimiters];
        if (delimiters.length === 0) {
            return {};
        } else if (delimiters.length === 1) {
            delimiters.push(delimiters[0]);
        } else if (delimiters.length === 2) {
            /* excerpt */
            // TODO
        } else {
            throw new Error('invalid options: ' + util.inspect(options, { compact: true, colors: true }));
        }
        if (delimiters[0] === defaultFrontMatterDelimiter && delimiters[1] === defaultFrontMatterDelimiter) {
            return {};
        } else {
            return { delimiters };
        }
    } else {
        return {};
    }
}
/**
 * Parse options argument to retrieve template excerpt parameters to add to configuration.
 * @param {*} options
 * @returns
 */
function frontMatterOptionExcerpt(options = { excerpt: false, excerpt_separator: defaultFrontMatterDelimiter, excerpt_alias: 'page.excerpt' }) {
    let excerpt,
        excerpt_separator,
        excerpt_alias,
        result = {};
    if (options) {
        switch (typeof options) {
            case 'object':
                excerpt = typeof options.excerpt === 'boolean' ? options.excerpt : options.excerpt || undefined;
                excerpt_separator = options.excerpt_separator || undefined;
                excerpt_alias = options.excerpt_alias || undefined;
                break;
            case 'boolean':
                excerpt = options;
                excerpt_separator = undefined;
                excerpt_alias = undefined;
                break;
            case 'string':
                excerpt = !!options;
                excerpt_separator = excerpt ? options : undefined;
                excerpt_alias = undefined;
                break;
            case 'function':
                excerpt = options;
                excerpt_separator = undefined;
                excerpt_alias = undefined;
                break;
            default:
                throw new Error('frontMatterOptionExcerpt: invalid excerpt: ' + util.inspect(excerpt, { compact: true, colors: true }));
        }
        if (excerpt) {
            if (typeof excerpt === 'string') {
                if (excerpt !== defaultFrontMatterDelimiter) {
                    excerpt_separator = excerpt;
                }
                result.excerpt = true;
            } else if (typeof excerpt !== 'boolean' && typeof excerpt !== 'function') {
                throw new Error('frontMatterOptionExcerpt: invalid excerpt: ' + util.inspect(excerpt, { compact: true, colors: true }));
            } else {
                result.excerpt = excerpt;
            }
            if (excerpt_separator && excerpt_separator !== defaultFrontMatterDelimiter) {
                result = Object.assign(result, { excerpt_separator });
            }
        } else if (typeof excerpt !== 'boolean' && excerpt_separator && typeof excerpt_separator === 'string') {
            if (excerpt_separator !== defaultFrontMatterDelimiter) {
                result = { excerpt: true, excerpt_separator };
            } else {
                result = { excerpt: true };
            }
        } else {
            result = {};
        }
    } else {
        result = {};
    }
    if (result.excerpt) {
        if (excerpt_alias) {
            if (typeof excerpt_alias !== 'string') {
                throw new Error('frontMatterOptionExcerpt: invalid excerpt_alias: ' + util.inspect(excerpt_alias, { compact: true, colors: true }));
            }
            if (excerpt_alias !== 'page.excerpt') {
                result.excerpt_alias = excerpt_alias;
            }
        }
    }
    return result;
}
/**
 * Get plugin from configuration if it exists.
 * @param {*} eleventyConfig
 * @param {*} name
 * @returns
 */
function configGetPlugin(eleventyConfig, name) {
    return eleventyConfig.plugins.find(function (plugin) {
        return plugin.plugin.name === name;
    });
}
/**
 * Util filters.
 */
const utilFilters = {
    split: function (value, delimiter) {
        return value.split(delimiter);
    },
    search: function (value, searchString) {
        return value.indexOf(searchString);
    },
    searchRegExp: function (value, searchRegExp) {
        const match = value.match(new RegExp(searchRegExp));
        return !!match ? match.index : -1;
    },
    prefix: function (value, prefix, postfix) {
        return `${typeof prefix === 'string' ? prefix : ''}${value}${typeof postfix === 'string' ? postfix : ''}`;
    },
    postfix: function (value, postfix, prefix) {
        return `${typeof prefix === 'string' ? prefix : ''}${value}${typeof postfix === 'string' ? postfix : ''}`;
    },
    field: function (value, field) {
        return value[field];
    },
    mapField: function (value, field) {
        return value.map((value) => value[field]);
    },
    readFile: function (filePath, _encoding) {
        return readFileBomSync(path.resolve(filePath));
    },
    removeFrontMatter: function (value) {
        return value.match(/^(?:---\r?\n(?:[\s\S]*)?---\r?\n)?([\s\S]+)$/)[1];
    },
    printIfTruthy: function (test, message) {
        return test ? message : '';
    },
    compileSCSS: function (scssPath) {
        return sass
            .compile(path.resolve(this.eleventy.directories.input, scssPath), {
                loadPaths: ['.', this.eleventy.directories.includes],
            })
            .css.toString();
    },
    processEnv: function (key, defaultValue = undefined) {
        if (typeof key === 'string') {
            return process.env[key] ?? defaultValue;
        } else if (typeof key === 'undefined') {
            return process.env;
        } else {
            throw new Error(`processEnv filter: invalid environment variable name: ${key}`);
        }
    },
};
/**
 * Util shortcodes.
 */
const utilShortcodes = {
    currentDate: function (format) {
        /* About formatting specification: https://moment.github.io/luxon/#/formatting */
        if (format === 'HTTP') {
            return DateTime.now().toHTTP();
        } else if (format === 'RFC2822') {
            return DateTime.now().toRFC2822();
        } else {
            return DateTime.now().toFormat(format || 'yyyy-MM-dd');
        }
    },
};
/**
 * Add entries from obj to configuration.
 * @param {*} eleventyConfig
 * @param {*} obj
 * @param {*} add
 */
function configAddEntries(eleventyConfig, obj, add) {
    for (const [name, fn] of Object.entries(obj)) {
        eleventyConfig[add](name, fn);
    }
}
/**
 * Adds the contents of files to the data cascade (global data).
 * @param {*} eleventyConfig
 * @param {*} dataPath
 * @param {*} slugify
 * @param {*} extFirstKey
 */
function configAddFileContentAsGlobalData(eleventyConfig, dataPath, slugify, extFirstKey = true) {
    if (typeof slugify === 'undefined' || slugify === true) {
        slugify = function (name) {
            return name.replace(/[\-\ ]/g, '_');
        };
    } else if (slugify === null || slugify === false) {
        slugify = function (name) {
            return name;
        };
    } else if (typeof slugify !== 'function') {
        // error
    }
    function loadContent(obj, dataPath) {
        fs.readdirSync(dataPath).forEach((entry) => {
            const dataPathEntry = path.join(dataPath, entry);
            const stats = fs.statSync(dataPathEntry);
            if (stats.isDirectory()) {
                loadContent((obj[entry] = {}), dataPathEntry);
            } else if (stats.isFile() || stats.isSymbolicLink()) {
                let extname = path.extname(entry);
                let basename = slugify(path.basename(entry, extname));
                extname = extname ? slugify(extname.substring(1)) : '.';
                const content = readFileBomSync(dataPathEntry);
                if (typeof extFirstKey === 'boolean') {
                    if (extFirstKey) {
                        if (typeof obj[extname] === 'undefined') {
                            obj[extname] = {};
                        }
                        obj[extname][basename] = content;
                    } else {
                        if (typeof obj[basename] === 'undefined') {
                            obj[basename] = {};
                        }
                        obj[basename][extname] = content;
                    }
                } else if (typeof extFirstKey === 'string') {
                    obj[basename + extFirstKey + extname] = content;
                } else {
                    // error
                }
            }
        });
    }
    const result = {};
    loadContent(result, dataPath);
    eleventyConfig.addGlobalData(path.basename(dataPath, path.extname(dataPath)), result);
}
/**
 * Nunjucks environment used to render explicit permalinks.
 */
const permalinkNunjucksEnvironment = new Nunjucks.Environment(null, {
    autoescape: false,
    throwOnUndefined: true,
});
for (const [name, filter] of Object.entries(utilFilters)) {
    permalinkNunjucksEnvironment.addFilter(name, filter);
}
/**
 * Factory for a permalink compiler that preserves the historical output
 * path behavior while allowing explicit Eleventy permalinks to override it.
 *
 * Explicit permalinks may be:
 *
 * - a string;
 * - a function that receives the data cascade;
 * - false, to disable output;
 * - null or undefined, to use the historical default permalink.
 *
 * @param {string} prefix Input path prefix expressed as a regular expression.
 * @param {string} extension Template extension without the leading dot.
 * @returns {Function} Eleventy permalink compiler.
 */
function prefixExtensionRemoveFactory(prefix, extension) {
    const regex = new RegExp(`^${prefix}(.*)\\.${extension}$`);
    return function (_inputContent, inputPath) {
        const defaultPermalink = inputPath.replace(regex, '$1');
        return async function (data) {
            let explicitPermalink = data?.permalink;
            /*
             * Permalinks declared in JavaScript data files may be functions.
             */
            if (typeof explicitPermalink === 'function') {
                try {
                    explicitPermalink = await explicitPermalink(data);
                } catch (error) {
                    throw new Error(`Cannot evaluate permalink function for ` + `"${inputPath}": ${error.message}`, {
                        cause: error,
                    });
                }
            }
            /*
             * Explicitly disables output.
             */
            if (explicitPermalink === false) {
                return false;
            }
            /*
             * Preserves the historical EleventyUtil behavior.
             */
            if (explicitPermalink === undefined || explicitPermalink === null) {
                return defaultPermalink;
            }
            if (typeof explicitPermalink !== 'string') {
                throw new TypeError(
                    `Invalid permalink for "${inputPath}": ` + 'expected a string, function, false, null, ' + `or undefined, but received ` + `"${typeof explicitPermalink}".`,
                );
            }
            /*
             * A permalink returned by a JavaScript function will normally
             * already be resolved. Rendering it again also permits the
             * function to return a Nunjucks permalink string.
             */
            try {
                return permalinkNunjucksEnvironment.renderString(explicitPermalink, data);
            } catch (error) {
                throw new Error(`Cannot render permalink for "${inputPath}": ` + `${error.message}`, {
                    cause: error,
                });
            }
        };
    };
}
/**
 * Template engines configuration.
 */
const templateEngine = {
    Nunjucks: {
        /* Aliasing Nunjucks template. */
        extension: templateExtension.Nunjucks,
        config: function (eleventyConfig, _format, permalinkPrefixRemove, _engine) {
            eleventyConfig.addTemplateFormats(templateExtension.Nunjucks[0]);
            eleventyConfig.setNunjucksEnvironmentOptions({
                autoescape: false,
            });
            eleventyConfig.addExtension(templateExtension.Nunjucks[0], {
                compileOptions: {
                    permalink: prefixExtensionRemoveFactory(permalinkPrefixRemove, templateExtension.Nunjucks[0]),
                },
            });
        },
    },
    SASS: {
        /* Custom SASS template. */
        extension: templateExtension.SASS,
        config: function (eleventyConfig, _format, permalinkPrefixRemove, _engine) {
            eleventyConfig.addTemplateFormats(templateExtension.SASS[0]);
            eleventyConfig.addExtension(templateExtension.SASS[0], {
                compileOptions: {
                    permalink: prefixExtensionRemoveFactory(permalinkPrefixRemove, templateExtension.SASS[0]),
                },
                // `compile` is called once per .scss file in the input directory
                compile: function (inputContent, inputPath) {
                    let parsed = path.parse(inputPath);
                    let result = SASS.compileString(inputContent, {
                        silenceDeprecations: ['global-builtin'],
                        loadPaths: [parsed.dir || '.', this.config.dir.includes],
                    });
                    /* Registering dependencies. */
                    this.addDependencies(inputPath, result.loadedUrls);
                    // This is the render function, `data` is the full data cascade
                    return (_data) => {
                        return result.css;
                    };
                },
            });
        },
    },
    CoffeeScript: {
        /* Custom CoffeeScript template. */
        extension: templateExtension.CoffeeScript,
        config: function (eleventyConfig, _format, permalinkPrefixRemove, _engine) {
            eleventyConfig.addTemplateFormats([templateExtension.CoffeeScript[0], templateExtension.CSON[0]]);
            eleventyConfig.addExtension(templateExtension.CoffeeScript[0], {
                compileOptions: {
                    permalink: prefixExtensionRemoveFactory(permalinkPrefixRemove, templateExtension.CoffeeScript[0]),
                },
                compile: function (inputContent, _inputPath) {
                    let result = CoffeeScript.compile(inputContent);
                    return (_data) => {
                        return result;
                    };
                },
            });
            eleventyConfig.addExtension(templateExtension.CSON[0], {
                compileOptions: {
                    permalink: prefixExtensionRemoveFactory(permalinkPrefixRemove, templateExtension.CSON[0]),
                },
                compile: function (inputContent, _inputPath) {
                    let result = CSON.parse(inputContent);
                    return (_data) => {
                        return result;
                    };
                },
            });
        },
    },
};
/**
 * Adds template formats to Eleventy configuration.
 * @param {*} eleventyConfig
 * @param {*} formats
 * @param {*} permalinkPrefixRemove
 */
function configAddTemplateFormat(eleventyConfig, formats = ['njk', 'scss'], permalinkPrefixRemove = '\\./input/') {
    const eleventyUtil = this;
    formats.forEach((format) => {
        templateEngine[templateFormatAlias[format]].config.bind(eleventyUtil)(eleventyConfig, format, permalinkPrefixRemove, templateEngine[templateFormatAlias[format]]);
    });
}
/**
 * The render template function factory. Implements front matter for templates rendered by plugin with improved parse engines.
 * @param {*} eleventyConfig Eleventy configuration.
 * @param {*} accessGlobalData Does rendered content has access to the data cascade?
 * @param {*} defaultTemplateData Default data passed for all calls of renderTemplateFunction result.
 * @param {*} tagName Option from eleventyRenderPlugin. The name of render template function.
 * @param {this} bind Optional bind.
 * @returns renderTemplateFunction
 */
function renderTemplateFunctionFactory(eleventyConfig, accessGlobalData = true, defaultTemplateData = {}, tagName = 'renderTemplate', bind) {
    const func = async function (input, ...args) {
        if (typeof input !== 'string' || args.length > 3) {
            throw new Error('invalid input argument');
        }
        /* Locally define externals for better performance. */
        const { engines, ...defaultOptions } = eleventyConfig.frontMatterParsingOptions,
            config = eleventyConfig,
            globalDataAccess = accessGlobalData,
            defaultData = Object.assign({}, defaultTemplateData),
            render = config.javascript.functions[tagName].bind(this);
        /* Parse arguments (args).
           Default is function(inputPath, templateLang, data, options) but
           we want to support any arguments order too. Additionally the
           arguments after inputPath are optional. */
        let templateLang, data, options;
        let isTemplateLangSet = false;
        if (args.length > 0) {
            args = args.map((arg) => (typeof arg !== 'undefined' ? arg : null));
            if (args.filter((arg) => typeof arg !== 'string' && typeof arg !== 'object' && (typeof arg !== 'boolean' || arg)).length > 0) {
                throw new Error('invalid arguments');
            } else {
                const languageArg = args.filter((arg) => typeof arg === 'string' || (typeof arg === 'boolean' && !arg));
                switch (languageArg.length) {
                    case 0:
                        templateLang = false;
                        break;
                    case 1:
                        templateLang = languageArg[0];
                        isTemplateLangSet = true;
                        break;
                    default:
                        throw new Error('invalid arguments');
                }
                const objectArg = args.filter((arg) => typeof arg === 'object');
                switch (objectArg.length) {
                    case 0:
                        data = defaultData;
                        options = {};
                        break;
                    case 1:
                        data = Object.assign(defaultData, objectArg[0] || {});
                        options = {};
                        break;
                    case 2:
                        data = Object.assign(defaultData, objectArg[0] || {});
                        options = Object.assign({}, objectArg[1] || {});
                        break;
                    case 3:
                        if (objectArg[0] === null || objectArg[1] === null || objectArg[2] === null) {
                            const dataOptionsArg = objectArg.filter((arg) => arg !== null);
                            data = Object.assign(defaultData, dataOptionsArg[0] || {});
                            options = Object.assign({}, dataOptionsArg[1] || {});
                            isTemplateLangSet = true;
                        } else {
                            throw new Error('invalid arguments');
                        }
                        break;
                }
                if (typeof options.templateLang !== 'undefined') {
                    if (isTemplateLangSet) {
                        throw new Error('invalid arguments');
                    } else if (typeof options.templateLang === 'string' || (typeof options.templateLang === 'boolean' && !options.templateLang)) {
                        templateLang = options.templateLang;
                        delete options.templateLang;
                    } else {
                        throw new Error('invalid arguments');
                    }
                }
            }
        } else {
            templateLang = false;
            data = defaultData;
            options = defaultOptions;
        }
        if (globalDataAccess) {
            data = Object.assign({}, this.ctx, data);
        }
        let parsed = { input };
        try {
            /* Parse and render front matter. */
            const delimiters = options.delimiters || [defaultFrontMatterDelimiter, defaultFrontMatterDelimiter];
            let match = input.match(new RegExp(`^(?:${delimiters[0]}([^\\-\\r\\n]\\w*)?\\r?\\n(?:([\\s\\S]*?)?\\r?\\n)?${delimiters[1]}(?:\\r?\\n)?)?([\\s\\S]*)$`));
            parsed.language = match[1] || defaultFrontMatterLanguage;
            parsed.matter = match[2] || '';
            parsed.content = match[3] || '';
            if (options.excerpt) {
                if (typeof options.excerpt === 'function') {
                } else if (typeof options.excerpt === 'boolean') {
                } else if (typeof options.excerpt === 'string') {
                } else {
                    // error
                }
            }
            parsed.matterRendered = await render(parsed.matter, data, templateLang);
            let parseEngine = engines[parsed.language];
            parsed.data = typeof parseEngine !== 'function' ? parseEngine.parse(parsed.matterRendered) : parseEngine(parsed.matterRendered);
            Object.assign(data, parsed.data);
        } catch (err) {
            err.message = 'cannot parse front matter of template: ' + err.message;
            throw err;
        }
        /* Render template file. */
        try {
            parsed.rendered = await render(parsed.content, data, templateLang);
        } catch (err) {
            err.message = 'cannot render template: ' + err.message;
            throw err;
        }
        return parsed;
    };
    return bind ? func.bind(bind) : func;
}
/**
 * # Render Template Tools
 *
 * This function is a factory, configuration and setup for render template
 * Tools.
 * @param {TemplateConfig} [eleventyConfig]
 * @param {String|Boolean|null} [rootPath]
 * @param {Object} defaultTemplateData
 * @param {Object} defaultTemplateOptions
 * @param {Object} renderPluginOptions
 *
 * This function performs the following tasks:
 *
 * 1. Adds the `EleventyRenderPlugin` to configuration if it has not already
 *    been added to the plugins. This plugin defines the `renderTemplate` and
 *    `renderFile` shortcodes, as well as the `renderContent` filter.
 * 2. Adds the `renderTemplateFile` shortcode and the filter of the same name.
 *
 * The `renderTemplate` and `renderFile` shortcodes, as well as the
 * `renderContent` filter, are added by the `EleventyRenderPlugin` plugin. The
 * `renderTemplateFile` shortcode and filter are generated and added by this
 * factory function.
 *
 * # Usage
 *
 * ## `renderTemplate` Paired Shortcode
 *
 * Use the `renderTemplate` paired shortcode to render a template string.
 * ```
 * {% renderTemplate "md" %}
 * # I am a title
 *
 * * I am a list
 * * I am a list
 * {% endrenderTemplate %}
 * ```
 *
 * The content inside of the shortcode will be rendered using Markdown
 * (`"md"`). Front matter is not yet supported.
 *
 * The first argument to renderTemplate can be any valid
 * [`templateEngineOverride`](https://www.11ty.dev/docs/languages/#templateengineoverride-examples)
 * value. You can even use "liquid,md" to preprocess markdown with liquid. You can use
 * [custom template types](https://www.11ty.dev/docs/languages/custom/) here too.
 *
 * **INFO:** The one exception here is that `{% renderTemplate "11ty.js" %}` JavaScript string templates are not yet supported - use `renderFile` below instead.
 *
 * ### Pass in data
 *
 * Both the [`eleventy`](https://www.11ty.dev/docs/data-eleventy-supplied/#eleventy-variable) and [`page` variables](https://www.11ty.dev/docs/data-eleventy-supplied/#page-variable) are available inside of these templates by default. If you want to pass in additional data, you can do so like this:
 *
 * ```
 * ---
 * myData:
 *   myKey: myValue
 * ---
 * {% renderTemplate "liquid", myData %}
 * {{ myKey }}
 * {% endrenderTemplate %}
 * ```
 *
 * Outputs `myValue`.
 *
 * ## `renderFile` Shortcode
 *
 * Use the `renderFile` shortcode to render an include file.
 *
 * ```
 * {% renderFile "./_includes/blogpost.md" %}
 * ```
 * The first argument to `renderFile` is a project root relative path to any
 * template file. Front matter inside of the target files is not yet
 * supported. The template syntax used is inferred by the file extension.
 *
 * Note that you can use files supported by any
 * [custom file extensions](https://www.11ty.dev/docs/languages/custom/)
 * you’ve added too!
 *
 * ### Pass in data
 *
 * Both the
 * [`eleventy`](https://www.11ty.dev/docs/data-eleventy-supplied/#eleventy-variable)
 * and [`page` variables](https://www.11ty.dev/docs/data-eleventy-supplied/#page-variable)
 * are available inside of these templates by default. If you want to pass in
 * additional data, you can do so like this:
 *
 * ```
 * ---
 * myData:
 *   myKey: myValue
 * ---
 * {% renderFile "./_includes/blogpost.md", myData %}
 * ```
 *
 * ### Override the target file syntax
 *
 * The syntax is normally inferred using the file extension, but it can be
 * overridden using a third argument. It can be any valid
 * [`templateEngineOverride`](https://www.11ty.dev/docs/languages/#templateengineoverride-examples)
 * value. You can even use `"liquid,md"` to preprocess markdown with liquid.
 *
 * ```
 * ---
 * myData:
 *   key: value
 * ---
 * {% renderFile "./_includes/blogpost.md", myData, "njk" %}
 * ```
 *
 * Will render `blogpost.md` using Nunjucks instead of Markdown!
 *
 * ## `renderContent` Filter
 *
 * Directly render a string of arbitrary template content.
 *
 * Consider the following Nunjucks template:
 *
 * ```
 * ---
 * myContent: "{{ 'Second' }}"
 * ---
 * {% renderTemplate %}{{ myContent }}{% endrenderTemplate %} from renderTemplate
 * {{ myContent | renderContent("njk") }} from renderContent
 * ```
 *
 * Outputs:
 *
 * ```
 * {{ 'Second' }} from renderTemplate
 * Second from renderContent
 * ```
 *
 * ## `renderTemplateFile` Shortcode and Filter
 *
 *
 *
 *
 */
function configAddRenderTemplateTools(eleventyConfig, rootPath, defaultTemplateData, defaultTemplateOptions, renderPluginOptions) {
    const renderPluginName = 'eleventyRenderPlugin';
    let renderPlugin = configGetPlugin(eleventyConfig, renderPluginName);
    if (!renderPlugin) {
        eleventyConfig.addPlugin(EleventyRenderPlugin, Object.assign({}, defaultRenderPluginOptions, renderPluginOptions || {}));
        renderPlugin = configGetPlugin(eleventyConfig, renderPluginName);
    }
    const { tagName, tagNameFile, filterName, accessGlobalData } = renderPlugin.options;
    if (typeof defaultTemplateData === 'undefined' || defaultTemplateData === null) {
        defaultTemplateData = {};
    } else if (typeof defaultTemplateData !== 'object') {
        throw new Error('configAddRenderTemplateTools: invalid defaultTemplateData argument');
    }
    if (typeof defaultTemplateOptions === 'undefined' || defaultTemplateOptions === null) {
        defaultTemplateOptions = {};
    } else if (typeof defaultTemplateOptions === 'string') {
        defaultTemplateOptions = { templateLang: defaultTemplateOptions };
    } else if (Array.isArray(defaultTemplateOptions) && defaultTemplateOptions.length <= 2 && defaultTemplateOptions.every((lang) => typeof lang === 'string')) {
        const result = {};
        if (defaultTemplateOptions[0]) {
            result.templateLang = defaultTemplateOptions[0];
        }
        if (defaultTemplateOptions[1]) {
            result.language = frontMatterOptionLanguage({ language: defaultTemplateOptions[1] });
        }
        defaultTemplateOptions = result;
    } else if (typeof defaultTemplateOptions !== 'object') {
        // error
    }
    /* Inhibits selected warnings. */
    process.emitWarning = (warning) => {
        if (warning.includes('Keys with collection values will be stringified')) {
            return;
        }
        console.warn(warning);
    };
    eleventyConfig.setFrontMatterParsingOptions(
        Object.assign(
            frontMatterOptionEngines(defaultTemplateOptions),
            frontMatterOptionLanguage(defaultTemplateOptions),
            frontMatterOptionDelimiters(defaultTemplateOptions),
            frontMatterOptionExcerpt(defaultTemplateOptions),
        ),
    );
    const { engines } = eleventyConfig.frontMatterParsingOptions;
    eleventyConfig.addShortcode('parse', function (text, reviver, language = 'json') {
        return engines[frontMatterOptionLanguage({ language: language || 'json' }).language || defaultFrontMatterLanguage].parse(text, reviver);
    });
    eleventyConfig.addFilter('parse', eleventyConfig.javascript.functions['parse']);
    eleventyConfig.addShortcode('stringify', function (value, replacer, space, language = 'json') {
        return engines[frontMatterOptionLanguage({ language: language || 'json' }).language || defaultFrontMatterLanguage].stringify(value, replacer, space);
    });
    eleventyConfig.addFilter('stringify', eleventyConfig.javascript.functions['stringify']);
    const renderTemplateFunction = renderTemplateFunctionFactory(eleventyConfig, accessGlobalData, defaultTemplateData, tagName);
    const tagNameTemplateString = tagName + 'String';
    eleventyConfig.addShortcode(tagNameTemplateString, async function (input, ...args) {
        return (await renderTemplateFunction.bind(this)(input, ...args)).rendered;
    });
    eleventyConfig.addAsyncFilter(tagNameTemplateString, eleventyConfig.javascript.functions[tagNameTemplateString]);
    const tagNameTemplateFile = tagName + 'File';
    eleventyConfig.addShortcode(tagNameTemplateFile, async function (inputPath, ...args) {
        if (typeof inputPath !== 'string' || args.length > 3) {
            throw new Error('invalid inputPath argument');
        }
        /* Locally define externals for better performance. */
        const config = eleventyConfig,
            root = rootPath,
            renderTemplateFunctionBound = renderTemplateFunction.bind(this);
        /* Set absolute input path. */
        if (typeof root === 'undefined' || root === null || root === false) {
            /* The inputPath is a current working directory relative path. */
            inputPath = path.resolve(process.cwd(), inputPath);
        } else if (root === true && typeof config.dir !== 'undefined' && typeof config.dir.input === 'string') {
            /* The inputPath is a input directory relative path. */
            inputPath = path.resolve(config.dir.input, inputPath);
        } else if (typeof root !== 'string') {
            throw new Error('configAddRenderTemplateTools: invalid rootPath: ' + util.inspect(root, { compact: true, colors: true }));
        } else {
            /* The inputPath is a rootPath argument relative path. */
            inputPath = path.resolve(root, inputPath);
        }
        console.log(`Rendering ${inputPath}`);
        /* Read input. */
        let input;
        try {
            input = readFileBomSync(inputPath);
        } catch (err) {
            err.message = 'cannot read input file ' + inputPath + ': ' + err.message;
            throw err;
        }
        return (await renderTemplateFunctionBound(input, ...args)).rendered;
    });
    eleventyConfig.addAsyncFilter(tagNameTemplateFile, eleventyConfig.javascript.functions[tagNameTemplateFile]);
    console.log(
        `EleventyRenderPlugin loaded with:\n${consolePrefix.indentation}  - Shortcodes: ${tagName}, ${tagNameFile}, ${tagNameTemplateString}, ${tagNameTemplateFile}\n${consolePrefix.indentation}  - Filters:    ${filterName}, ${tagNameTemplateString}, ${tagNameTemplateFile}`,
    );
}
/**
 * Default Render Plugin options.
 */
const defaultRenderPluginOptions = {
    /* Change the renderTemplate shortcode name. */
    tagName: 'renderTemplate',
    /* Change the renderFile shortcode name. */
    tagNameFile: 'renderFile',
    /* Change the renderContent filter name. */
    filterName: 'renderContent',
    /* Does rendered content has access to the data cascade? Eleventy
       supports only in Liquid right now (v3.0.0). This factory
       provides support for Nunjucks and others. */
    accessGlobalData: true,
};
/**
 * Runs Eleventy, passing the configuration and options. Executes callback if
 * passed. Executes error if passed and there is an error.
 * @param {*} config
 * @param {*} options
 * @param {*} callback
 * @param {*} error
 * @returns
 */
async function run(
    config = async function (_eleventyConfig) {
        return defaultEleventyOptions;
    },
    options,
    callback,
    error,
) {
    const configPath = path.resolve(os.tmpdir(), `eleventy-${uuid()}.js`);
    fs.writeFileSync(configPath, `module.exports = function (eleventyConfig) {\n    return ${JSON.stringify(options, null, 2)};\n}`);
    async function runEleventy() {
        const eleventy = new Eleventy(options.dir.input, options.dir.output, {
            configPath,
            quietMode: true,
            config,
        });
        await eleventy.initializeConfig();
        await eleventy.write();
        return eleventy;
    }
    return runEleventy()
        .then(function (eleventy) {
            fs.unlinkSync(configPath);
            if (callback && typeof callback === 'function') {
                return callback(eleventy);
            } else {
                return eleventy;
            }
        })
        .catch(function (err) {
            console.error(err.message);
            try {
                fs.unlinkSync(configPath);
            } catch {}
            if (error && typeof error === 'function') {
                error(err);
            }
            throw err;
        });
}
/**
 * Transform image files.
 * @param {*} transform
 * @param {*} options
 * @returns
 */
async function transformImage(transform, options) {
    return Promise.all(
        transform.map(async function (image) {
            const imageOptions = Object.assign({}, image);
            delete imageOptions.src;
            if (typeof imageOptions.outputDir === 'undefined') {
                imageOptions.outputDir = options.dir.output;
            }
            const outputDirPath = path.resolve(imageOptions.outputDir);
            try {
                fs.accessSync(outputDirPath, fs.constants.F_OK);
                console.log(`Directory ${outputDirPath} already exists.`);
            } catch {
                console.log(`Creating directory ${outputDirPath} ...`);
                fs.mkdirSync(outputDirPath, { recursive: true });
                console.log(`Creating directory ${outputDirPath} done.`);
            }
            const src = options.dir.input + '/' + image.src;
            console.log(`Building image from source: ${src} ...`);
            const icoIndex = imageOptions.formats.indexOf('ico');
            let outputIcoPath;
            if (icoIndex > -1) {
                imageOptions.formats.splice(icoIndex, 1);
                const ico = await toIco(src, imageOptions.widths);
                const filename = `${imageOptions.outputBasename || src.split('/').pop().split('.')[0]}.ico`;
                outputIcoPath = path.join(outputDirPath, filename);
                fs.writeFileSync(outputIcoPath, ico);
                console.log(`Building image format: ico, widths: ${imageOptions.widths.join(',')}, output: ${filename}`);
            }
            let metadata = {};
            if (imageOptions.formats.length > 0) {
                try {
                    let basename;
                    if (imageOptions.outputBasename) {
                        basename = imageOptions.outputBasename;
                        delete imageOptions.outputBasename;
                    }
                    metadata = await Image(src, {
                        filenameFormat: function (_id, src, width, format, _options) {
                            const result = `${basename || src.split('/').pop().split('.')[0]}-${width}.${format}`;
                            console.log(`Building image format: ${format}, width: ${width}, output: ${result}`);
                            return result;
                        },
                        ...imageOptions,
                    });
                } catch (err) {
                    console.error(`Error building image from source: ${src}: ${err.message}`);
                    throw err;
                }
            }
            if (icoIndex > -1) {
                image.formats.push('ico');
                metadata.ico = [
                    {
                        format: 'ico',
                        filename: path.basename(src),
                        outputPath: outputIcoPath,
                    },
                ];
            }
            console.log(`Building image from source: ${src} done.`);
            return { image, metadata };
        }),
    );
}
/**
 * Exports
 */
export {
    readFileBom,
    readFileBomSync,
    templateExtension,
    templateFormatAlias,
    defaultDirectories,
    defaultEleventyOptions,
    console,
    parseEngine,
    utilFilters,
    utilShortcodes,
    configGetPlugin,
    configAddEntries,
    configAddFileContentAsGlobalData,
    prefixExtensionRemoveFactory,
    templateEngine,
    configAddTemplateFormat,
    configAddRenderTemplateTools,
    run,
    transformImage,
};
/**
 * Default exports
 */
export default {
    readFileBom,
    readFileBomSync,
    templateExtension,
    templateFormatAlias,
    defaultDirectories,
    defaultEleventyOptions,
    console,
    parseEngine,
    utilFilters,
    utilShortcodes,
    configGetPlugin,
    configAddEntries,
    configAddFileContentAsGlobalData,
    prefixExtensionRemoveFactory,
    templateEngine,
    configAddTemplateFormat,
    configAddRenderTemplateTools,
    run,
    transformImage,
};
