import { spawnSync } from 'child_process';
import { createFile, deleteDirectoryRecursiveOrFile, copyDirectoryRecursiveOrFile, createDirectoryRecursive } from './directoriesAndFiles.js';
import { resolvePath } from './pathResolver.js';
import { success } from './alerts.js';

export async function performActions(actions, appVars) {
    // if(actions.execute) {
    //     for await (const command of actions.execute) {
    //         await executeAction(command, appVars.fullPath, appVars);
    //     }
    // }
    // if(actions.merge) {
    //     for (const filePathFrom in actions.merge) {
    //         mergeFilesAction(filePathFrom, actions.merge[filePathFrom], appVars);
    //     }
    // }
    // if(actions.copy) {
    //     for (const filePathFrom in actions.copy) {
    //         copyAction(filePathFrom, actions.copy[filePathFrom], appVars);
    //     }
    // }
    // if(actions.replace) {
    //     for (const filePathFrom in actions.replace) {
    //         replaceAction(filePathFrom, actions.replace[filePathFrom], appVars);
    //     }
    // }
    // if(actions.delete) {
    //     actions.delete.forEach(deletePath => {
    //         deleteAction(deletePath, appVars);
    //     });
    // }
    // if(actions.create_folder) {
    //     actions.create_folder.forEach(createPath => {
    //         createFolderAction(createPath, appVars);
    //     });
    // }
    if(actions.create_file) {
        actions.create_file.forEach(createPath => {
            createFileAction(createPath, appVars);
        });
    }
}

/**
 * DONE: Execute console command in in shell
 * 
 * @param {*} command
 * @param {*} workDir Context where command will be executed
 * @param {*} [appVars=null] App environment and user variables. Null if command execute not in the app context.
 */
export async function executeAction(command, workDir, appVars = null) {
    if(appVars !== null) {
        command = replaceUserVariables(command, appVars);
    }
    execConsoleCommand(command, workDir);
    success('"'+ command +'" successfully executed');

}

/**
 * DONE: Copy file or dorectories. Files copy to files, and folder to folders, y can't copy file in folder and folder in file. Error if file exist.
 * 
 * @param {string} fromPath Path from app in fern apps folder. Example: 'frontend-app/components'
 * @param {string} toPath Path to desctination dorecctory from current app folder
 * @param {*} appVars App environment and user variables
 */
export function copyAction(fromPath, toPath, appVars) {
    fromPath = resolvePath(appVars.templateAppfullPath, fromPath);
    toPath = resolvePath(appVars.fullPath, toPath);
    copyDirectoryRecursiveOrFile(fromPath, toPath, false);
    success(fromPath + ' successfully copied');
}

/**
 * DONE: Replace file or directories. Files replaced files, and folder - folders, y can't replace file to folder and folder to file.
 *
 * @param {*} fromPath Path from app in fern apps folder. Example: 'frontend-app/components'
 * @param {*} toPath Path to desctination dorecctory from current app folder
 * @param {*} appVars App environment and user variables
 */
export function replaceAction(fromPath, toPath, appVars) {
    fromPath = resolvePath(appVars.templateAppfullPath, fromPath);
    toPath = resolvePath(appVars.fullPath, toPath);
    copyDirectoryRecursiveOrFile(fromPath, toPath, true);
    success(fromPath + ' successfully replaced');
}


/**
 * DONE: Create folder recursive from current app folder
 * 
 * @param {*} createPath Path from current app folder
 * @param {*} appVars App environment and user variables
 */
export function createFolderAction(createPath, appVars) {
    createPath = resolvePath(appVars.fullPath, createPath);
    createDirectoryRecursive(createPath);
    success(createPath + ' folder successfully created');
}


/**
 * DONE: Create empty file recursive from current app folder
 * 
 * @param {*} createPath Path from current app folder
 * @param {*} appVars App environment and user variables
 */
export function createFileAction(createPath, appVars) {
    createPath = resolvePath(appVars.fullPath, createPath);
    createFile(createPath, '');
    success(createPath + ' file successfully created');
}

/**
 * DONE: Three-way file merge using "git merge-file" 
 * 
 * @param {*} filePathFrom Path from an app in the fern apps folder to the file that will be merged with a destination file
 * @param {*} appFilePath Path to the desctination file from the current app folder that will be changed
 * @param {*} appVars App environment and user variables
 */
export function mergeFilesAction(filePathFrom, appFilePath, appVars) {
    const tempFilePath = resolvePath(appVars.devFolder, 'temp.txt');
    createFile(tempFilePath, '');
    appFilePath = resolvePath(appVars.fullPath, appFilePath);
    filePathFrom = resolvePath(appVars.templateAppfullPath, filePathFrom);
    execConsoleCommand('git merge-file ' + appFilePath + ' ' + tempFilePath + ' ' + filePathFrom, appVars.fullPath);
    deleteDirectoryRecursiveOrFile(tempFilePath);
    success('Changes successfully merged in ' + appFilePath);
}

/**
 * DONE: Delete file or folder in app directory
 * 
 * @param {*} path Path of the folder or file to delete from the current app folder
 * @param {*} appVars App environment and user variables
 */
export function deleteAction(path, appVars) {
    console.log(path);
    path = resolvePath(appVars.fullPath, path);
    console.log(path);
    deleteDirectoryRecursiveOrFile(path);
    success(path + ' successfully deleted');
}


export function replaceUserVariables(data, appVars) {
    for (const [key, userVariable] of Object.entries(appVars)) {
        data = data.replace(new RegExp(`\\$\\{\\{${key}\\}\\}`, "g"), userVariable);
    }
    return data;
}

function execConsoleCommand(command, workDir) {
    spawnSync(command,[], { stdio: 'inherit', shell: true, cwd: workDir });
}