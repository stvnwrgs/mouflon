/// <reference path="../../typings/index.d.ts" />

var color:any = require('cli-color');

export default class Utils {
    static exitWithError(errorMessage:string) {

        console.log(
            color.yellow(
                "\n+----------------------------------------------+" +
                "\n|      ") + color.xterm(200).bold('An error occurred - Can\'t continue') + color.yellow("      |" +
                "\n+----------------------------------------------+") +
            "\n" +
            "\nError:\n" +
            color.red.bold(errorMessage) +
            "\n");
        process.exit(1);
    }
}