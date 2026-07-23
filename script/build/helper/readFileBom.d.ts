/**
 * Read a file asynchronously using the encoding declared by its byte order mark
 * when one is present.
 *
 * @param filePath File path to read.
 * @param options Options forwarded to `fs.readFile`; defaults to UTF-8.
 * @param callback Callback forwarded to `fs.readFile`.
 */
export default function (filePath: string, options: Record<string, unknown>, callback: any): void;
