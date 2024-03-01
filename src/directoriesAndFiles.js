import fs from 'fs';
import path from 'path';
import { alert, success, rError } from './alerts.js';
import { fernPath, fernAppsPath, projectsFolderPath } from './config.js'
import { resolvePath }  from './pathResolver.js'


/**
 * @param {*} directoryPath this is the path start from projects folder. Example: 'project-name/app-name/components'
 */
export function createDirectoryRecursive(directoryPath) {
  
    const resultPath = resolvePath(projectsFolderPath, directoryPath);

    if (!fs.existsSync(resultPath)){
        try {
            fs.mkdirSync(resultPath, { recursive: true });
            success(directoryPath + ' successfully created');
        } catch (error) {
            rError(error);
        }
    } else {
        alert(resultPath + " directory is exist");
    }
 }
 
 export function checkFileExist(filePath) {
    const resultPath = fernPath + '/' + filePath;
    try {
        fs.accessSync(resultPath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
 }

 export function createFile(directoryPath, fileName, fileData) {

    directoryPath = directoryPath.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');  // Remove leading directory markers, and remove ending /file-name.extension
    const resultPath = projectsFolderPath + '/' + directoryPath;
    const filePath = path.join(resultPath, fileName);

    try {
        fs.writeFileSync(filePath, fileData);
        success('File ' + fileName + ' successfully created');
    } catch(error) {
        rError('Writing file error: ' + error);
        return;
    }
 }

 export function replaceFile(fromFilePath, replacedFilePath){

 }


 /**
  * @param {string} fromPath Path from app in fern apps folder. Example: 'frontend-app/components'
  * @param {string} toPath Path to desctination dorecctory
  */
 export function copyDirectoryRecursiveOrFile(fromPath, toPath){
    fromPath = fernAppsPath + '/' + fromPath;
    toPath = projectsFolderPath + '/' + toPath;
    fs.cpSync(fromPath, toPath, {dereference: true, recursive: true})
 }

 export function createDockerComposeFileInAppDirectory(templateComposeFilePath, newComposeFilePath, appName, appVars){

    templateComposeFilePath = fernPath + '/' + templateComposeFilePath;

    try {
        let data = fs.readFileSync(templateComposeFilePath, 'utf8');

        const variableRegex = /\$\{\{(\w+)\}\}/g;
    
        data = data.replace(/\$\{\{appName\}\}/g, appName);
        // Заміна виразів ${{variable_name}} на значення відповідних змінних
        let replacedData = data.replace(variableRegex, (match) => {

            let variableName = match.slice(3, -2);

            if (appVars[variableName]) {
                return appVars[variableName];
            } else {
                return match;
            }
        });
        
        createDirectoryRecursive(newComposeFilePath);
        createFile(newComposeFilePath, 'docker-compose.yml', replacedData);

    } catch(error) {
        rError('Reading file error: ' + error);
        return;
    }

    
}

export function createDockerComposeFileForProject(appName, composePathes) {

    let resultStringComposePathes = 'include:'
    composePathes.forEach(path => {
        resultStringComposePathes += `\n  - path: ${path}`;
    });

    let templateProjectComposeFilePath = fernPath + '/configs/docker-compose.yml';

    try {

        let data = fs.readFileSync(templateProjectComposeFilePath, 'utf8');

        data = data.replace(/\#\$\{\{apps\}\}/g, resultStringComposePathes);
          
        createFile(appName, 'docker-compose.yml', data);

    } catch(error) {
        rError('Reading file error: ' + error);
        return;
    }
}

