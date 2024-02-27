import 'zx/core';
import { $ } from "zx";
import prompts from 'prompts';
import { alert, rError } from "./alerts.js";
import { FERN_CONFIG } from './config.js'
import { createDirectories, checkFileExist, createDockerComposeFileInAppDirectory } from "./directoriesAndFiles.js";

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

        createAppDirectories();
        createDockerEnvironment();
        
    }

    function createAppDirectories() {
        createDirectories(response.appName);

        response.appTypes.forEach(appType => {
            let app = FERN_CONFIG.apps.find((app) => app.value === appType);
            createDirectories(response.appName + '/' + response.appName + app.vars.folder_name_sufix);
        });
    }

    function createDockerEnvironment() {
        response.appTypes.forEach(appType => {
           
            let templateComposeFilePath = 'configs/' + appType + '/docker-compose.yml';

            if(checkFileExist(templateComposeFilePath)) {

                let app = FERN_CONFIG.apps.find((app) => app.value === appType);
                let newComposeFilePath = response.appName + '/' + response.appName + app.vars.folder_name_sufix + '/dev_infrastructure';

                createDockerComposeFileInAppDirectory(templateComposeFilePath, newComposeFilePath, response.appName, app.vars);
            }
            
        });
    }

    

})();



