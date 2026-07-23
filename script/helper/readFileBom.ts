import fs from 'node:fs';

/**
 * Read a file asynchronously using the encoding declared by its byte order mark
 * when one is present.
 *
 * @param filePath File path to read.
 * @param options Options forwarded to `fs.readFile`; defaults to UTF-8.
 * @param callback Callback forwarded to `fs.readFile`.
 */
export default function (filePath: string, options: Record<string, unknown>, callback: any): void {
    if (options) {
        if (typeof options === 'string') {
            options = { encoding: options };
        } else if (typeof options === 'object') {
            if (options.encoding) {
                if (typeof options.encoding !== 'string') {
                    fs.readFile(filePath, options, callback);
                    return;
                }
            } else {
                options = Object.assign({}, options, { encoding: 'utf-8' });
            }
        } else {
            fs.readFile(filePath, options, callback);
            return;
        }
    } else {
        options = { encoding: 'utf-8' };
    }
    const fd = fs.openSync(filePath, 'r');
    const bom = Buffer.alloc(3);
    fs.readSync(fd, bom, 0, 3, 0);
    fs.closeSync(fd);
    if (bom[0] === 0xef && bom[1] === 0xbb && bom[2] === 0xbf) {
        options.encoding = 'utf-8';
    } else if (bom[0] === 0xff && bom[1] === 0xfe) {
        options.encoding = 'utf-16le';
    } else if (bom[0] === 0xfe && bom[1] === 0xff) {
        options.encoding = 'utf-16be';
    }
    fs.readFile(filePath, options, callback);
}
