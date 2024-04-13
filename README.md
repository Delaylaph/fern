<p align="center">
	<br>
	<br>
	<img width="530" src="ai-fern.png" alt="fern">
	<br>
	<br>
	<br>
</p>
<h1 align="center">Fern</h1>
<p align="center">
  <b>Don't write the same code twice.</b>
</p>
Fern is a console application that helps you create new projects or update existing ones using a configuration file. And it also simplifies work with many projects if you use docker.  
<br/><br/>

> [!NOTE]
> This is not production ready version. But it's already works =)

## Table of contents
* [Requirments](#requirments)
* [Instalation](#instalation)
* [Setup your projects](#setup-your-projects)
* [How to use](#how-to-use)


## Requirments
 - git
 - node.js

## Instalation

1. Clone repo.
```
$ git clone https://github.com/Delaylaph/fern.git
```
2. Update __fern.json__ and specify:
- `fern_foler_path` - the path to the folder where you will be save fern config, temlate projects and features.
- `projects_folder_path` - the path to the folder where you save all your projects. 

Example:
```json
{
    "fern_foler_path": "L:/Dev/ferna",
    "projects_folder_path" : "L:/Dev" 
}
```
Next step will be platform specific.

### Windows

3. Add the ability to execute fern from anywhere in the console:

__Step 1:__ Change path to current fern folder in __fern.bat__: This bat file executed when you write fern commands.
```
@echo off
node here_your_path_to_fern_foler\fern\src\main.js %*
```
__Step 2:__ Add fern to your PATH environment variable. This is required to run fern commands from anywhere in console.<br/>
	- Open the Settings.<br/>
	- Under System, click on "About".<br/>
	- Click on "Advanced system settings".<br/>
	- Click "Environment Variables...".<br/>
	- Click the edit to modify the existing PATH variable and add path to current fern folder (L:\Dev\fern\ for example).
    
### Linux / WSL

3. Add the command for fern to the terminal:

__Step 1:__ From home directory open .bashrc file.
```
sudo nano .bashrc
```
__Step 2:__ Add a line at the bottom of the file and change <path_to_fern_foler> to the folder path where the cloned fern repository is located.
```
alias fern='node <path_to_fern_foler>/src/main.js'
```
__Step 3:__ Reboot terminal.

<br/>
Now you can execute fern from the console / terminal in any folder.

## Setup your projects
First of all, you need to create a folder where the apps that will be templates and the fern configuration will be stored. You can create it anywhere you want, but the path to this folder must be the same as `fern_foler_path` in fern.json. For example, I named this folder ferna (for example):
```
ferna
├── apps - Template apps that will be used to create new ones. Each application in this folder must be named exactly the same as the key value in fern.json.
├── docker-env - This folder is required if you use docker for your projects. You can create folders named the same as the app keys in in fern.json where will be `docker-compose.yml` file for each app. This compose files will be automatically included in the final docker-compose.yml project file.
│	└── docker-compose.yml - Docker compose file 
├── fern-config.json - Fern apps configuration file.
```

### Fern configuration
__fern-config.json__ is the main file where you specify which apps fern can create and how. Here is a simple example:
```json
{
    "apps" : [
        {
            "title": "Frontend landing",
            "key": "frontend-landing",
            "vars": {
                "folder_name_sufix": "-site"
            },
            "actions": {
                "execute": [
                    "docker run -it --rm -w /temp/dev --mount type=bind,src=${{fullPath}},dst=/temp/dev node:20.11.1 npx nuxi@latest init ./ --force"
                ],
            },
            "features" : []
        },
    ]
}
```

Here are the parameters that need to be specified for each application:
| Param | Type | Description |
| ----- | :--: | ----------- |
| title | `string` | The name of your application that will be written when you choose what you want to create. It is important that this is not the name of the final product, but of the template on the basis of which further applications will be created. For example: 'java backend', 'android app', 'frontend landing' |
| key | `string` | The key is a unique identifier of each application, I recommend just using its name written through a dash |
| vars | `object` | Vars is a set of variables that you can use when creating a new application, release features or describing a docker compose file. They are automatically replaced by the values you specify. They are used with the following syntax: ${{example_var}}. <br/> There is only one required `folder_name_sufix` variable. In it, you specify the suffix that will be added to the name of the folder of the application that will be created. <br/> Also, variables are automatically added to this set, which you can also use: <br/> - projectName <br/> - fullPath <br/> - templateAppfullPath <br/> - devFolder <br/> - composeFileFullPath <br/> - templateComposeFileFullPath |
| actions | `object` | Actions are what are performed when creating a new application. You can specify actions such as: <br/> - execute <br/> - merge <br/> - copy <br/> - replace <br/> - delete <br/> - create_folder <br/> - create_file  <br/> More details about the activities will be below. |
| features | `array` | Features are separate parts of the application's functionality that you can add to it using fern commands. |

##### Features
You can describe the features that the application can have. They allow you to add functionality to already existing applications. For example: 
```json
{
    "features" : [
        {
            "name": "Auth",
            "key": "auth",
            "actions": {
                "create_file": [
                    "test.txt"
                ]
            }
        }
    ]
}
```
| Param | Type | Description |
| ----- | :--: | ----------- |
| name | `string` | The feature's name that will be written when you choose what feature you want to release.|
| key | `string` | The key is a unique identifier of each feature, I recommend just using its name written through a dash. |
| actions | `object` | Actions are what are performed when you release the feature. This is exactly the same as application actions. |

##### Actions
Actions describe exactly what will be done when creating an application or releasing a feature. They are performed sequentially and synchronously. All operations within each action are also performed sequentially and synchronously. This is done to prevent cases where the wrong execution sequence affects the resulting application. They can be as follows:

| Action | Type | Description |
| ----- | :--: | ----------- |
| execute | `array` | Execute console command in in shell. You can use the variables described in `vars`, they will be replaced by the specified values at runtime.|
| merge | `object` | Three-way file merge using "git merge-file".|
| copy | `object` | Copy file or dorectories. Files copy to files, and folder to folders, you can't copy file in folder and folder in file. Return error if file exist.|
| replace | `object` | Replace file or directories. Files replaced files, and folder - folders, you can't replace file to folder and folder to file.|
| delete | `array` | Delete file or folder in app directory.|
| create_folder | `array` | Create folder recursive from current app folder. |
| create_file | `array` | Create empty file recursive from current app folder. |

Example: 
```json
{
    "actions": {
        "execute": [
            "ls",
            "docker run -it --rm -w /temp/dev --mount type=bind,src=${{fullPath}},dst=/temp/dev node:20.11.1 npx nuxi@latest init ./ --force"
        ],
        "merge": {
        "path/to/file/with/changes.txt" : "path/to/file/that/will/be/changed.txt"
        },
        "copy": {
            "nuxt.config.ts": "nuxt.config.ts"
        },
        "replace": {
            "path/to/file.txt" : "path/to/file/that/will/be/replaced.txt"
        },
        "delete": [
            "path/to/folder"
            "path/to/file.txt"
        ],
        "create_folder": [
            "test/folder"
        ],
        "create_file": [
            "test.txt"
        ]
    },
}
```

### Fern and docker
If you using docker fern can simplify setup your development environment. Fern uses traefik to manage the routes of all projects. For work with docker you need create `docker-compose.yml` file in the docker-env folder at the path specified in `fern_folier_path` in fern.json. Here is the minimum required version of this file:
```yml
version: "3.3"

#${{apps}}

networks:
  default:
    name: proxynet
    external: true
```
`#${{apps}}` - will be replaced with the contents of the docker files of each of your applications

For example, you have a simple frontend aplication that uses the nuxt framework. Than your docker-env folder will look something like this:
```
├── docker-env
│   ├── fronted-nuxt
│   │   ├── .dockerignore
│   │   ├── Dockerfile
│	│	└── docker-compose.yml 
│	└── docker-compose.yml 
``` 
Where a `Dockerfile` can have this content:
```Dockerfile
FROM node:20.11.1

WORKDIR /usr/src/app

EXPOSE 3000
ENTRYPOINT [ "npm", "run", "dev" ]
```
And `docker-compose.yml` inside fronted-nuxt folder:
```yml
version: '3'

services:
  app:
    build: .
    container_name: ${{projectName}}${{folder_name_sufix}}
    volumes:
      - ../:/usr/src/app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${{projectName}}${{folder_name_sufix}}.rule=Host(`${{projectName}}${{folder_name_sufix}}.localhost`)" 
      - "traefik.http.routers.${{projectName}}${{folder_name_sufix}}.entrypoints=web"
      - "traefik.http.services.${{projectName}}${{folder_name_sufix}}.loadbalancer.server.port=3000" #port that service is exposed
```

## How to use
To use fern you just need to type `fern` in the console. This will prompt you to choose one of the commands you can execute. 
Fern have 3 commands:
- create 
- release
- compose

`fern create` - Create new project step by step based on the configuration file. You can also use `fern create project_name` to skip the project name step.

`fern release` - Release a new feature in an existing application. Also release command can take parameters to skip prompts, namely: `fern release project_name`, `fern release app_name`, or `fern release app_name feature_name`.
If you are already in the application folder, you can just type `fern release feature_name`.

`fern compose` - Execute `docker compose up -d` command inside project folder. Compose command without a project name can be executed only if your current path is a project folder. Else you shoud use `fern compose project_name`.
You can also use any docker compose command you if you pass additional parameters afrer project name parameter. For example: `fern compose project_name stop`.