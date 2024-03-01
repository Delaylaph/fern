import { fernShell } from './config.js';
import { spawnSync } from 'child_process';

export async function executeAction(command, workDir, app = null) {
    if(app !== null) {
        command = replaceUserVariables(command, app);
    }
    spawnSync(command,[], { stdio: 'inherit', shell: true, cwd: workDir });
}

export function copyAction(fromPath, toPath) {
    
}

export function createFolderAction() {

}

export function createFileAction() {

}

export function replaceFilesAction() {
    
}

export function mergeFilesAction() {
    
}

function replaceUserVariables(data, app) {
    return data.replace(/\$\{\{appPath\}\}/g, app.fullPath);
}