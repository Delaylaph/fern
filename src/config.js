import { readFile } from 'fs/promises';
import path from 'path';

export const fernAppsPath = path.resolve(import.meta.dirname, '../../boilerplate_apps');
export const fernEnvPath = path.resolve(import.meta.dirname, '../../fern_env');
export const projectsFolderPath = path.resolve(import.meta.dirname,'../..');

export const FERN_CONFIG = JSON.parse(await readFile(fernEnvPath + '/fern-config.json'));
