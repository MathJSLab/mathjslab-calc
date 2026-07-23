import path from 'node:path';
import util from 'node:util';
import fs from 'node:fs';
import { Jimp } from 'jimp';
import pngToIco from 'png-to-ico';
import { Resvg } from '@resvg/resvg-js';
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
export default async function toIco(src, sizes, engine) {
    let sourcePath;
    if (typeof src === 'string') {
        sourcePath = path.resolve(src);
    }
    else if (Array.isArray(src) && src.every((srcPath) => typeof srcPath === 'string')) {
        sourcePath = path.resolve(...src);
    }
    else {
        throw new Error('invalid arguments:\nsrc: string | string[] = ' +
            util.inspect(src, {
                compact: false,
                colors: true,
            }));
    }
    let iconSizes;
    if (typeof sizes === 'number') {
        iconSizes = [sizes];
    }
    else if (Array.isArray(sizes) && sizes.every((size) => typeof size === 'number')) {
        iconSizes = [...sizes].sort((a, b) => a - b);
    }
    else if (typeof sizes === 'undefined' || sizes === null) {
        iconSizes = [16, 24, 32, 48, 64, 128, 256];
    }
    else {
        throw new Error('invalid arguments:\nsizes?: number | number[] | null = ' +
            util.inspect(sizes, {
                compact: false,
                colors: true,
            }));
    }
    validateIconSizes(iconSizes);
    let selectedEngine;
    if (!engine || engine === 'auto') {
        selectedEngine = path.extname(sourcePath).toLowerCase() === '.svg' ? 'resvg' : 'jimp';
    }
    else if (engine === 'jimp' || engine === 'resvg') {
        selectedEngine = engine;
    }
    else {
        throw new Error("invalid arguments:\nengine?: 'auto' | 'jimp' | 'resvg' | null = " +
            util.inspect(engine, {
                compact: false,
                colors: true,
            }));
    }
    const fileBuffer = await fs.promises.readFile(sourcePath);
    const pngBuffers = selectedEngine === 'resvg' ? renderSvg(fileBuffer, iconSizes) : await renderRaster(fileBuffer, iconSizes);
    return pngToIco(await pngBuffers);
}
/**
 * Creates PNG buffers from a raster image.
 */
async function renderRaster(fileBuffer, sizes) {
    const sourceImage = await Jimp.read(fileBuffer);
    return Promise.all(sizes.map(async (size) => {
        const resizedImage = sourceImage.clone().cover({
            w: size,
            h: size,
        });
        return resizedImage.getBuffer('image/png');
    }));
}
/**
 * Creates PNG buffers from an SVG image.
 */
function renderSvg(fileBuffer, sizes) {
    return Promise.resolve(sizes.map((size) => Buffer.from(new Resvg(fileBuffer, {
        fitTo: {
            mode: 'width',
            value: size,
        },
    })
        .render()
        .asPng())));
}
/**
 * Validates dimensions supported by png-to-ico.
 */
function validateIconSizes(sizes) {
    const supportedSizes = new Set([16, 24, 32, 48, 64, 128, 256]);
    const invalidSizes = sizes.filter((size) => !Number.isInteger(size) || !supportedSizes.has(size));
    if (invalidSizes.length > 0) {
        throw new Error(`unsupported ICO image sizes: ${invalidSizes.join(', ')}\n` + `supported sizes: ${[...supportedSizes].join(', ')}`);
    }
}
