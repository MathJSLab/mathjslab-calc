import { tsImport } from 'tsx/esm/api';

export default async () => {
    const { i18nData } = await tsImport('../src/i18n.ts', import.meta.url);
    return i18nData;
};
