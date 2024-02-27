import fs from 'fs';
import path from 'path';
import { alert, success, rError } from './alerts.js';
import { fernPath, projectsFolderPath  } from './config.js'

export function createDirectories(directoryPath) {
  
    directoryPath = directoryPath.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
    const resultPath = projectsFolderPath + '/' + directoryPath;

    if (!fs.existsSync(resultPath)){
        fs.mkdir(path.resolve(resultPath), { recursive: true }, error => {
            if (error) {
                rError(error);
            } else {
                success(directoryPath + ' successfully created');
            }
        });
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

    fs.writeFile(filePath, fileData, (error) => {
        if (error) {
            rError('Writing file error: ' + error);
            return;
        }
        success('File ' + fileName + ' successfully created');
    });
 }

 export function createDockerComposeFileInAppDirectory(templateComposeFilePath, newComposeFilePath, appName, appVars){

    templateComposeFilePath = fernPath + '/' + templateComposeFilePath;

    fs.readFile(templateComposeFilePath, 'utf8', (error, data) => {
        if (error) {
            rError('Reading file error: ' + error);
            return;
        }

        // Регулярний вираз для пошуку змінних типу ${{variable_name}}
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
        
        createDirectories(newComposeFilePath);
        createFile(newComposeFilePath, 'docker-compose.yml', replacedData);
    });
}

