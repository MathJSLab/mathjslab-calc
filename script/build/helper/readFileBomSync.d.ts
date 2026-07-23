/**
 * Read a file synchronously using the encoding declared by its byte order mark
 * when one is present.
 *
 * @param filePath File path to read.
 * @param options Options forwarded to `fs.readFileSync`; defaults to UTF-8.
 * @returns File contents decoded with the selected encoding.
 */
export default function (filePath: string, options: Record<string, unknown>): string;
