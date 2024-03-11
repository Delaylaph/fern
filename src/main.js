import 'zx/core';
import prompts from 'prompts';
import { alert } from "./alerts.js";
import { FERN_CONFIG } from './config.js'
import { createDirectoryRecursive, checkFileExist, createDockerComposeFileInAppDirectory, createDockerComposeFileForProject, createDirectoryRecursiveFromPojectsFolder, copyDirectoryRecursiveOrFile } from "./directoriesAndFiles.js";
import { executeAction, performActions } from './actions.js'
import { getProjectFullPath, getAppFullPath, getAppComposeFileFullPath, getTemplateComposeFileFullPath, getAppDevFolderFullPath, getConfigAppFolderFullPath, getTemplateAppFolderFullPath } from './pathResolver.js'

const args = process.argv.slice(2);

let crateAppQuestions = [
    {
        name: 'projectName',
        type: 'text',
        initial: 'test-app',
        message: `What is project name?`,
        validate: projectName => projectName.replaceAll(' ','').length > 0 ? true : 'Project name must contain at least 1 character'
    },
    {
        name: 'appTypes',
        type: 'multiselect',
        message: 'What apps do you want to create?',
        choices: FERN_CONFIG.apps,
        min: 1,
        instructions: false,
        hint: '- Space to select'
    }

];

let response = {};

(async () => {

    if (args[0] === undefined) {

        response = await prompts({
            name: 'iWantTo',
            type: 'select',
            message: 'What do you want to do?',
            choices: [
                { title: 'Create new project', value: 'create' },
                { title: 'Update exist app', value: 'update' }
            ],
            initial: 0
        });
    } else {
        response.iWantTo = args[0];
    }

    if (response.iWantTo === 'create') {
        await createApp();
    } else {
        alert(response.iWantTo + ' is unknown command');
    }

    async function createApp() {
        response = await prompts(crateAppQuestions);

        setupAppsConfigs();
        createAppDirectories();
        createDockerEnvironment();
        await doStarterActions();

        if(FERN_CONFIG.useDocker) {
           await executeAction('docker compose up -d', getProjectFullPath(response.projectName));
        }
    }

    function setupAppsConfigs() {
        response.projectName = response.projectName.replaceAll(' ','');
        FERN_CONFIG.apps = FERN_CONFIG.apps.filter((app) => {
            if(response.appTypes.find(appType => app.value === appType) !== undefined) {
                app.vars.projectName = response.projectName;
                app.vars.fullPath = getAppFullPath(response.projectName, app.vars.folder_name_sufix);
                app.vars.templateAppfullPath = getTemplateAppFolderFullPath(app.value);
                app.vars.devFolder = getAppDevFolderFullPath(response.projectName, app.vars.folder_name_sufix);
                app.vars.composeFileFullPath = getAppComposeFileFullPath(response.projectName, app.vars.folder_name_sufix);
                app.vars.templateComposeFileFullPath = getTemplateComposeFileFullPath(app.value);

                return true;
            }
            return false;
        });
    }

    function createAppDirectories() {
        createDirectoryRecursiveFromPojectsFolder(response.projectName);
        FERN_CONFIG.apps.forEach(app => {
            createDirectoryRecursive(app.vars.fullPath);
        });
    }

    function createDockerEnvironment() {
        let composePathes = [];
        FERN_CONFIG.apps.forEach(app => {
            if(checkFileExist(app.vars.templateComposeFileFullPath)) {
                composePathes.push(app.vars.composeFileFullPath);
                copyDirectoryRecursiveOrFile(getConfigAppFolderFullPath(app.value), app.vars.devFolder, true);
                createDockerComposeFileInAppDirectory(app.vars.templateComposeFileFullPath, app.vars.composeFileFullPath, app.vars);
              
            }
        });
        if(composePathes.length !== 0) {
            FERN_CONFIG.useDocker = true;
            createDockerComposeFileForProject(response.projectName, composePathes);
        }
    }

    async function doStarterActions() {
        for await (const app of FERN_CONFIG.apps) {
            await performActions(app.actions, app.vars);
        }
    }
})();



