import { readFile } from 'fs/promises';

const FERN_PATHS = JSON.parse(await readFile(new URL('../fern.json', import.meta.url)));

export const fernPath = FERN_PATHS.fern_foler_path;  
export const fernAppsPath = fernPath + '/apps';
export const projectsFolderPath = FERN_PATHS.projects_folder_path;

export const FERN_CONFIG = JSON.parse(await readFile(fernPath + '/fern-config.json'));