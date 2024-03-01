import path from 'path';
import { projectsFolderPath, fernPath } from './config.js'


export function resolvePath(pathLeftPart, pathRightPart) {
    pathRightPart = pathRightPart.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
    return path.join(pathLeftPart, pathRightPart);
}


export function getAppFullPath(appName, folderNameSufix) {
    return path.join(projectsFolderPath, appName, appName + folderNameSufix);
}

export function getCurrentAppComposeFileFullPath(appName, folderNameSufix) {
    return path.join(projectsFolderPath, appName, appName + folderNameSufix, '/dev_infrastructure/docker-compose.yml');
}

export function getTemplateComposeFileFullPath(appType) {
    return path.join(fernPath, 'configs', appType, '/docker-compose.yml');
}