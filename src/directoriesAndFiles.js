import fs from 'fs';
import path from 'path';
import { alert, success, rError } from './alerts.js';
import { fernAppsPath, projectsFolderPath } from './config.js'
import { resolvePath, getTemplateProjectComposeFileFullPath, getProjectComposeFileFullPath }  from './pathResolver.js'


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
            success(fullPath + ' successfully created');
        } catch (error) {
            rError(error);
        }
    } else {
        alert(fullPath + " directory is exist");
    }
 }
 
 export function checkFileExist(fullPath) {
    try {
        fs.accessSync(fullPath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
 }

 export function createFile(fileFullPath, fileData) {
    try {
        fs.writeFileSync(fileFullPath, fileData);
        success('File ' + fileFullPath + ' successfully created');
    } catch(error) {
        rError('Writing file error: ' + error);
        return;
    }
 }

 export function replaceFile(fromFilePath, replacedFilePath){

 }

 export function copyDirectoryRecursiveOrFile(fromPath, toPath){
    fs.cpSync(fromPath, toPath, {dereference: true, recursive: true});
    success(fromPath + ' successfully copied');
 }

/**
 * @param {string} fromPath Path from app in fern apps folder. Example: 'frontend-app/components'
 * @param {string} toPath Path to desctination dorecctory
 */
export function copyInAppContext(fromPath, toPath) { //TODO:
    fromPath = fernAppsPath + '/' + fromPath;
    toPath = projectsFolderPath + '/' + toPath;
    copyDirectoryRecursiveOrFile(fromPath, toPath);
}

 export function createDockerComposeFileInAppDirectory(templateComposeFilePath, newComposeFilePath, projectName, appVars){

    try {
        let data = fs.readFileSync(templateComposeFilePath, 'utf8');

        const variableRegex = /\$\{\{(\w+)\}\}/g;
    
        data = data.replace(/\$\{\{projectName\}\}/g, projectName);
        // Заміна виразів ${{variable_name}} на значення відповідних змінних
        let replacedData = data.replace(variableRegex, (match) => {

            let variableName = match.slice(3, -2);

            if (appVars[variableName]) {
                return appVars[variableName];
            } else {
                return match;
            }
        });
        
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

