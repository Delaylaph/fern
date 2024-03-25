import path from 'path';
import { projectsFolderPath, fernPath } from './config.js'


export function resolvePath(pathLeftPart, pathRightPart) {
    return path.join(pathLeftPart, pathRightPart);
}

export function getProjectFullPath(projectName) {
    return path.join(projectsFolderPath, projectName);
}

export function getAppFullPath(projectName, folderNameSufix) {
    return path.join(projectsFolderPath, projectName, projectName + folderNameSufix);
}

export function getAppComposeFileFullPath(projectName, folderNameSufix) {
    return path.join(projectsFolderPath, projectName, projectName + folderNameSufix, '/dev_infrastructure/docker-compose.yml');
}

export function getAppDevFolderFullPath(projectName, folderNameSufix) {
    return path.join(projectsFolderPath, projectName, projectName + folderNameSufix, '/dev_infrastructure');
}

export function getTemplateAppFolderFullPath(appKey) {
    return path.join(fernPath, 'apps', appKey);
}

export function getDockerEnvAppFolderFullPath(appKey) {
    return path.join(fernPath, 'docker-env', appKey);
}
export function getTemplateComposeFileFullPath(appKey) {
    return path.join(fernPath, 'docker-env', appKey, 'docker-compose.yml');
}

export function getProjectComposeFileFullPath(projectName) {
    return path.join(projectsFolderPath, projectName, 'docker-compose.yml');
}

export function getTemplateProjectComposeFileFullPath() {
    return path.join(fernPath, 'docker-env/docker-compose.yml');
}