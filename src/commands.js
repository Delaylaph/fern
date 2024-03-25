import prompts from 'prompts';
import { FERN_CONFIG } from './config.js'
import { createDirectoryRecursive, 
         checkFileOrFolderExist, 
         createDockerComposeFileInAppDirectory, 
         createDockerComposeFileForProject, 
         createDirectoryRecursiveFromPojectsFolder, 
         copyDirectoryRecursiveOrFile,
        } from "./directoriesAndFiles.js";
import { executeAction, performActions } from './actions.js'
import { resolvePath,
         getProjectFullPath, 
         getAppFullPath, 
         getAppComposeFileFullPath, 
         getTemplateComposeFileFullPath, 
         getAppDevFolderFullPath, 
         getDockerEnvAppFolderFullPath, 
         getTemplateAppFolderFullPath } from './pathResolver.js'
import { rError, info } from './alerts.js';
import { readdirSync } from 'fs'
import { projectsFolderPath } from './config.js'

let response = {};

export async function createProjectCommand(projectName) {
    let crateProjectQuestions = [
        {
            name: 'projectName',
            type: () => projectName == undefined ? 'text' : null,
            initial: 'test-app',
            message: `What is project name?`,
            validate: projectName => projectName.replaceAll(' ','').length > 0 ? true : 'Project name must contain at least 1 character.'
        },
        {
            name: 'appKeys',
            type: 'multiselect',
            message: 'What apps do you want to create?',
            choices: FERN_CONFIG.apps.map(app => {
                return {
                    title: app.title, 
                    value: app.key
                }
            }),
            min: 1,
            instructions: false,
            hint: '- Space to select'
        }
    
    ];
    response = await prompts(crateProjectQuestions);
    createProject();
}

export async function releaseFeatureCommand(AppOrProjectNameOrFeatureName, featureName) {
    if(featureName !== undefined) {
        if(!isAppName(AppOrProjectNameOrFeatureName)) {
            rError(AppOrProjectNameOrFeatureName +' app is not exist.');
            return;
        }
        if(!isFeatureNameOrKey(featureName, AppOrProjectNameOrFeatureName)) {
            rError(featureName + ' feature is not exist.');
            return;
        }
        releaseAppFeatures(getProjectNameByAppName(AppOrProjectNameOrFeatureName), getAppKeyByAppName(AppOrProjectNameOrFeatureName), featureName);
    } else {
        let wrongChoice = false;

        let releaseFeatureQuestions = [
            {
                name: 'projectName',
                type: () => {
                    if(AppOrProjectNameOrFeatureName == undefined) {
                        return 'select';
                    }
                    return null;
                },
                message: `Which project do you want to update?`,
                choices: () => {
                    return getProjects()
                },
                hint: '- Space to select',
                instructions: false,
            },
            {
                name: 'appKey',
                type: (prev) => {
                    if(prev != undefined) {
                        if(!isProjectName(prev)) {
                            wrongChoice = true;
                            rError(prev + ' is not a project name.');
                            return null;
                        }
                        return 'select';
                    } else if(isProjectName(AppOrProjectNameOrFeatureName)) {
                        return 'select';
                    }
                    return null;
                },
                message: `In which application in this project you need to add a feature.`,
                choices: (prev) => {
                    return getProjectApps(prev != undefined ? prev : AppOrProjectNameOrFeatureName);
                },
                hint: '- Space to select',
                instructions: false,
            },
            {
                name: 'featuresName',
                type: (prev) => {
                    if(prev != undefined) {
                        if(!isAppKey(prev)) {
                            wrongChoice = true;
                            rError(prev + ' is not a application name.');
                            return null;
                        }
                        return 'multiselect';
                    } else if(isAppName(AppOrProjectNameOrFeatureName)) {
                        return 'multiselect';
                    }
                    return null;
                },
                message: 'What features do you want to release?',
                choices: (prev) => {
                    return getAppFeatures(prev != undefined ? prev : getAppKeyByAppName(AppOrProjectNameOrFeatureName));
                },
                min: 1,
                instructions: false,
            }
        ];
        response = await prompts(releaseFeatureQuestions);

        if(wrongChoice === true) {
            return;
        }
        if(response.featuresName !== undefined) {
            releaseAppFeatures(
                response.projectName != undefined ? response.projectName : getProjectNameByAppName(AppOrProjectNameOrFeatureName), 
                response.appKey != undefined ? response.appKey : getAppKeyByAppName(AppOrProjectNameOrFeatureName), 
                response.featuresName);
            return;
        } 

        let appPath = getAppPath();

        if(appPath !== null) {
            if(!isFeatureNameOrKey(AppOrProjectNameOrFeatureName, getLastFolderFromPath(appPath))) {
                rError(AppOrProjectNameOrFeatureName + ' is not a project or an app, or a feature.');
                return;
            }
            let appName = getLastFolderFromPath(appPath);
            releaseAppFeatures(getProjectNameByAppName(appName), getAppKeyByAppName(appName), AppOrProjectNameOrFeatureName);
        }

        rError(AppOrProjectNameOrFeatureName + ' is not a project or an app. If you wont to release feature only by it\'s name or key you need write it in an app folder.');
        return;
    }
}

export async function dockerComposeCommand(projectName, commandParams) {
    if(projectName == undefined) {
        let projectPath = process.cwd();
        if(!isProjectName(getLastFolderFromPath(projectPath))) {
            rError('Compose command without a project name can be executed only if your current path is a project folder.');
            return;
        }
        await executeAction('docker compose up -d', projectPath);
    } else {
        if(!isProjectName(projectName)) {
            rError(projectName + ' is not a project name.');
            return;
        }
        if(commandParams.length === 0) {
            await executeAction('docker compose up -d', getProjectFullPath(projectName));
        } else {
            await executeAction(`docker compose ${commandParams.join(' ')}`, getProjectFullPath(projectName));
        }
    }
}


async function createProject() {
    setupAppsConfigs();
    createProjectDirectories();
    createDockerEnvironment();
    await doStarterActions();

    if(FERN_CONFIG.useDocker) {
       await executeAction('docker compose up -d', getProjectFullPath(response.projectName));
    }
    info('Project created');
}



function setupAppsConfigs() {
    response.projectName = response.projectName.replaceAll(' ','');
    FERN_CONFIG.apps = FERN_CONFIG.apps.filter((app) => {
        if(response.appKeys.find(appKey => app.key === appKey) !== undefined) {
            app.vars.projectName = response.projectName;
            app.vars.fullPath = getAppFullPath(response.projectName, app.vars.folder_name_sufix);
            app.vars.templateAppfullPath = getTemplateAppFolderFullPath(app.key);
            app.vars.devFolder = getAppDevFolderFullPath(response.projectName, app.vars.folder_name_sufix);
            app.vars.composeFileFullPath = getAppComposeFileFullPath(response.projectName, app.vars.folder_name_sufix);
            app.vars.templateComposeFileFullPath = getTemplateComposeFileFullPath(app.key);

            return true;
        }
        return false;
    });
}

function setupAppVars(vars, appKey, projectName) {
    vars.projectName = projectName;
    vars.fullPath = getAppFullPath(projectName, vars.folder_name_sufix);
    vars.templateAppfullPath = getTemplateAppFolderFullPath(appKey);
    vars.devFolder = getAppDevFolderFullPath(projectName, vars.folder_name_sufix);
    vars.composeFileFullPath = getAppComposeFileFullPath(projectName, vars.folder_name_sufix);
    vars.templateComposeFileFullPath = getTemplateComposeFileFullPath(appKey);
    
    return vars;
}


function createProjectDirectories() {
    createDirectoryRecursiveFromPojectsFolder(response.projectName);
    FERN_CONFIG.apps.forEach(app => {
        createDirectoryRecursive(app.vars.fullPath);
    });
}

function createDockerEnvironment() {
    let composePathes = [];
    FERN_CONFIG.apps.forEach(app => {
        if(checkFileOrFolderExist(app.vars.templateComposeFileFullPath)) {
            composePathes.push(app.vars.composeFileFullPath);
            copyDirectoryRecursiveOrFile(getDockerEnvAppFolderFullPath(app.key), app.vars.devFolder, true);
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

async function releaseAppFeatures(projectName, appKey, features) {

    const app = FERN_CONFIG.apps.find(app => {
        if(app.key === appKey) {
            app.vars = setupAppVars(app.vars, app.key, projectName);
            return true
        }
    });

    if (!app) return; // If app not found, exit

    if(typeof features === 'string') {
        for (const feature of app.features) {
            if(feature.key === features || feature.name === features) {
                await performActions(feature.actions, app.vars);
            }
        }
    } else {
        for (const feature of app.features) {
            for (const featureNameOrKey of features) {
                if(feature.key === featureNameOrKey || feature.name === featureNameOrKey) {
                    await performActions(feature.actions, app.vars);
                }
            }
            
        }
    }
    info('Feature(s) released');
}

function getAppPath() {
    let path =  process.cwd();
    let appName = getLastFolderFromPath(path);

    for (const app of FERN_CONFIG.apps) {
        if (appName.includes(app.vars.folder_name_sufix)) {
            return path;
        }
    }
    return null;
}

function getLastFolderFromPath(path) {
    return path.split(/[\\/]/).pop();
}

function getProjects() {
    return readdirSync(projectsFolderPath, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => { return {title: dir.name, value: dir.name} });
}

function getProjectApps(projectName) {
    return readdirSync(resolvePath(projectsFolderPath, projectName), { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => { 
        let resultObj = {
            title: dir.name,
            value: dir.name
        }
        for (const app of FERN_CONFIG.apps) {
            if(dir.name.includes(app.vars.folder_name_sufix)) {
                resultObj.value = app.key;
            }
        }
        return resultObj;
    });
}

function getAppFeatures(appKey) {
    for (const app of FERN_CONFIG.apps) {
        if (appKey === app.key) {
            return app.features.map(feature => {
                return {
                    title: feature.name,
                    value: feature.key
                }
            });
        }
    }
}

function isProjectName(potentialProjectName) {

    let projects = getProjects();
    
    for (const project of projects) {
        if(potentialProjectName === project.title) {
            return true;
        }
    }
    return false;
}

function isAppName(potentialAppName) {
    if(potentialAppName != undefined) {
        for (const app of FERN_CONFIG.apps) {
            if (potentialAppName.includes(app.vars.folder_name_sufix)) {
                let projectName = potentialAppName.slice(0, -app.vars.folder_name_sufix.length);
                if(checkFileOrFolderExist(resolvePath(projectsFolderPath, projectName, potentialAppName))) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isAppKey(potentialAppKey) {
    for (const app of FERN_CONFIG.apps) {
        if (potentialAppKey === app.key) {
          return true;
        }
    }
    return false;
}

function isFeatureNameOrKey(potentialFeatureName, appName) {
    for (const app of FERN_CONFIG.apps) {
        if(appName.includes(app.vars.folder_name_sufix)) {
            for (const feature of app.features) {
                if(feature.key === potentialFeatureName || feature.name === potentialFeatureName) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getAppKeyByAppName(appName) {
    for (const app of FERN_CONFIG.apps) {
        if (appName.includes(app.vars.folder_name_sufix)) {
            return app.key;
        }
    }
    return null;
}

function getProjectNameByAppName(appName) {
    for (const app of FERN_CONFIG.apps) {
        if (appName.includes(app.vars.folder_name_sufix)) {
            return appName.slice(0, -app.vars.folder_name_sufix.length);
        }
    }
    return null;
}