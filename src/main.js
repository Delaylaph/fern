import 'zx/core';
import prompts from 'prompts';
import { alert } from "./alerts.js";
import { FERN_CONFIG } from './config.js'
import { createDirectoryRecursive, checkFileExist, createDockerComposeFileInAppDirectory, createDockerComposeFileForProject } from "./directoriesAndFiles.js";
import { projectsFolderPath } from './config.js'
import { executeAction } from './actions.js'
import { getAppFullPath, getCurrentAppComposeFileFullPath, getTemplateComposeFileFullPath } from './pathResolver.js'

const args = process.argv.slice(2);

let crateAppQuestions = [
    {
        name: 'appName',
        type: 'text',
        initial: 'test-app',
        message: `What is app name?`
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
                { title: 'Create new app', value: 'create' },
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
        // createDockerEnvironment();
        // await doStarterActions();
    }

    function setupAppsConfigs() {
        FERN_CONFIG.apps = FERN_CONFIG.apps.filter((app) => {
            if(response.appTypes.find(appType => app.value === appType) !== undefined) {
                app.fullPath = getAppFullPath(response.appName, app.vars.folder_name_sufix);
                app.composeFileFullPath = getCurrentAppComposeFileFullPath(response.appName, app.vars.folder_name_sufix);
                app.templateComposeFileFullPath = getTemplateComposeFileFullPath(app.value);

                return true;
            }
            return false;
        });
    }

    function createAppDirectories() {
        createDirectoryRecursive(response.appName);

        FERN_CONFIG.apps.forEach(app => {
            createDirectoryRecursive(response.appName + '/' + response.appName + app.vars.folder_name_sufix);
        });
    }

    function createDockerEnvironment() {

        let composePathes = [];

        response.appTypes.forEach(appType => {
           
            let templateComposeFilePath = getTemplateComposeFilePath(appType);

            if(checkFileExist(templateComposeFilePath)) {

                let app = FERN_CONFIG.apps.find((app) => app.value === appType);
                let newComposeFilePath = getCurrentAppComposeFilePath(response.appName, app.vars.folder_name_sufix);
                composePathes.push('./' + response.appName + app.vars.folder_name_sufix + '/dev_infrastructure/docker-compose.yml');

                createDockerComposeFileInAppDirectory(templateComposeFilePath, newComposeFilePath, response.appName, app.vars);
                
            }
            
        });

        if(composePathes.length !== 0) {
            createDockerComposeFileForProject(response.appName, composePathes);
        }
    }

    async function doStarterActions() {
        for await (const appType of response.appTypes) {
            let app = FERN_CONFIG.apps.find((app) => app.value === appType);
            app.path = projectsFolderPath + '/' + response.appName + '/' + response.appName + app.vars.folder_name_sufix;

            if(app.actions.execute) {
                for await (const command of app.actions.execute) {
                    executeAction(command, app.path);
                }
            }

        }
    }
})();



