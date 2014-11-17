var color: any = require('cli-color');

class Utils {
    static exitWithError( errorMessage: string ) {

        console.log(
            color.yellow(
                "\n+-------------------------------------------------+" +
                "\n|  ") + color.xterm(200).bold('An error occurred - Can\'t continue') + color.yellow("         |" +
            "\n+-------------------------------------------------+") +
            "\n" +
            "\nError:" +
            color.red.bold(errorMessage) +
            "\n");
        process.exit(1);
    }
}

export = Utils;