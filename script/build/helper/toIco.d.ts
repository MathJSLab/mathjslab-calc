type ImageEngine = 'auto' | 'jimp' | 'resvg';
/**
 * Creates an ICO icon from an image.
 *
 * SVG images are rasterized with Resvg.
 * Raster images are resized and converted to PNG with Jimp.
 *
 * @param src Source image path.
 * @param sizes Image sizes to include in the ICO file.
 * @param engine Engine used to resize and convert the image.
 * @returns A Buffer containing the ICO file.
 */
export default function toIco(src: string | string[], sizes?: number | number[] | null, engine?: ImageEngine | null): Promise<Buffer>;
export {};
