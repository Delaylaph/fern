import { chalk } from "zx";

export function success(message) {
    console.log('\n '+chalk.green(message));
}

export function info(message) {
    console.log('\n '+chalk.blue(message));
}

export function alert(message) {
    console.log('\n '+chalk.rgb(255, 175, 46)(message));
}

export function rError(message) {
    console.log('\n '+chalk.redBright(message));
}