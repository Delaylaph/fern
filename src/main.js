import 'zx/core';
import prompts from 'prompts';
import { alert } from "./alerts.js";
import { createProjectCommand, releaseFeatureCommand, dockerComposeCommand } from './commands.js'

const args = process.argv.slice(2);

let response = {};

(async () => {

    if (args[0] === undefined) {

        response = await prompts({
            name: 'iWantTo',
            type: 'select',
            message: 'What do you want to do?',
            choices: [
                { title: 'Create new project', value: 'create' },
                { title: 'Release feature', value: 'release' },
                { title: 'Docker compose', value: 'compose' }
            ],
            initial: 0
        });
    } else {
        response.iWantTo = args[0];
    }

    if (response.iWantTo === 'create') {
        await createProjectCommand(args[1]);
    } else if(response.iWantTo === 'release') {
        await releaseFeatureCommand(args[1], args[2]);
    } else if(response.iWantTo === 'compose') {
        await dockerComposeCommand(args[1], args.slice(2));
    }  else {
        alert(response.iWantTo + ' is unknown command');
    }
})();



