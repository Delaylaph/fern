import { readFile } from 'fs/promises';

export const FERN_CONFIG = JSON.parse(await readFile(new URL('../configs/fern-config.json', import.meta.url)));