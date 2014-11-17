import AbstractService=require('./AbstractService');

var color: any = require('cli-color');

class LogService extends AbstractService {


    logStart( string: string ) {
        console.log(color.greenBright.bgBlackBright(string));
    }

    logEnd( string: string ) {
        console.log(color.greenBright(string));
    }

    error( string: string ) {
        console.log(color.red.bold(string));
    }

    warn( string: string ) {
        console.log(color.yellow.bold(string));
    }
}

export = LogService;