import { $ } from "zx";
import { fernShell } from './config.js';
import { execSync, spawn } from 'child_process';

export async function executeAction(command, appPath) {
   
    command = replaceUserVariables(command, appPath);
    const shell = spawn(command,[], { stdio: 'inherit', shell: true });
    shell.on('close',(code)=>{
        console.log('child process exited with code ',code)
    });

       //$.shell=fernShell;
    // $.noquote = async (...args) => { 
    //     const q = $.quote; 
    //     $.quote = v => v; 
    //     const p = $(...args); 
    //     await p; 
    //     $.quote = q; 
    //     return p;
    // };
    // await $.noquote`${command}`
    // console.log(process.env.ComSpec);
    // execSync(command, {shell: fernShell});
    //await $`command`;
  
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

function replaceUserVariables(data, appPath) {
    return data.replace(/\$\{\{appPath\}\}/g, appPath);
}