import fs from 'fs';
import path from 'path';
import { alert, success, rError } from './alerts.js';
import { fernPath, fernAppsPath, projectsFolderPath } from './config.js'
import { resolvePath, getDockerEnvAppFolderFullPath, getTemplateProjectComposeFileFullPath, getProjectComposeFileFullPath }  from './pathResolver.js'
import { replaceUserVariables } from './actions.js'


/**
 * @param {*} directoryPath this is the path start from projects folder. Example: 'project-name/app-name/components'
 */
export function createDirectoryRecursiveFromPojectsFolder(directoryPath) {
    const resultPath = resolvePath(projectsFolderPath, directoryPath);
    createDirectoryRecursive(resultPath);
 }

 export function createDirectoryRecursive(fullPath) {
    if (!fs.existsSync(fullPath)){
        try {
            fs.mkdirSync(fullPath, { recursive: true });
        } catch (error) {
            rError(error);
        }
        return true;
    } else {
        alert(fullPath + " directory is exist");
    }
    return false;
 }
 
 export function checkFileOrFolderExist(fullPath) {
    try {
        fs.accessSync(fullPath, fs.constants.F_OK);
    } catch (err) {
        return false;
    }
    return true;
 }

 export function createFile(fileFullPath, fileData) {
    try {
        fs.writeFileSync(fileFullPath, fileData);
    } catch(error) {
        rError('Writing file error: ' + error);
        return false;
    }
    return true;
 }

export function copyDirectoryRecursiveOrFile(fromPath, toPath, replace){
    try {
        if(replace === true) {
            fs.cpSync(fromPath, toPath, {dereference: true, recursive: true });
        } else {
            fs.cpSync(fromPath, toPath, {dereference: true, recursive: true, errorOnExist: true, force: false });
        }
        return true;
    } catch(error) {
        rError('Copy error: ' + error);
        return false;
    }
}

export function deleteDirectoryRecursiveOrFile(fullPath) {
    try {
        fs.rmSync(fullPath, { recursive: true });
    } catch(error) {
        rError('Deleting error: ' + error);
        return false;
    }
    return true;
}

 export function createDockerComposeFileInAppDirectory(templateComposeFilePath, newComposeFilePath, appVars){

    try {
        let data = fs.readFileSync(templateComposeFilePath, 'utf8');

        let replacedData = replaceUserVariables(data, appVars);
        
        createDirectoryRecursive(newComposeFilePath.replace('docker-compose.yml', ''));
        createFile(newComposeFilePath, replacedData);

    } catch(error) {
        rError('Reading file error: ' + error);
        return;
    }

}

export function createDockerComposeFileForProject(projectName, composePathes) {
    let resultStringComposePathes = 'include:'
    composePathes.forEach(path => {
        resultStringComposePathes += `\n  - path: ${path}`;
    });
    try {
        let data = fs.readFileSync(getTemplateProjectComposeFileFullPath(), 'utf8');
        data = data.replace(/\#\$\{\{apps\}\}/g, resultStringComposePathes);
        createFile(getProjectComposeFileFullPath(projectName), data);
    } catch(error) {
        rError('Reading file error: ' + error);
        return;
    }
}

