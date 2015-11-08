import AbstractService from './AbstractService';

var color: any = require('cli-color');

export default class LogService extends AbstractService {

    static MAX_INDENT = 10;
    static INDENT_CHAR = '  ';
    private indent: number = 0;

    increaseIndent() {
        this.indent = Math.min(LogService.MAX_INDENT, this.indent + 1);
    }

    decreaseIndent() {
        this.indent = Math.max(0, this.indent - 1);
    }

    startSection(string: string) {
        console.log(this.getTimeString() + color.greenBright.bgBlackBright(string));
        this.increaseIndent();
    }

    closeSection(string: string) {
        console.log(this.getTimeString() + color.greenBright(string));
        this.decreaseIndent();
    }

    logCommand(string: string) {
        console.log(this.getTimeString() + color.white(string));
    }

    logResult(string: string) {
        console.log(this.getTimeString() + color.blackBright(string));
    }

    logAndKeepColors(string: string) {
        console.log(string);
    }

    debug(string: string) {
        console.log(this.getTimeString() + color.white(string));
    }

    info(string: string) {
        console.log(this.getTimeString() + color.whiteBright(string));
    }

    error(string: string) {
        console.log(this.getTimeString() + color.red.bold(string));
    }

    warn(string: string) {
        console.log(this.getTimeString() + color.yellow.bold(string));
    }

    private getTimeString() {
        let now = new Date(),
            timeString;

        timeString = ('00' + now.getHours()).substr(-2, 2) +
        ':' +
        ('00' + now.getMinutes()).substr(-2, 2) +
        ':' +
        ('00' + now.getSeconds()).substr(-2, 2) +
        (now.getMilliseconds() / 1000).toFixed(3).substr(1);

        return color.blackBright(timeString + ' - ') + this.getIndentChars();
    }

    getIndentChars(): string {
        let s = '',
            i = this.indent;
        for (i = this.indent; i > 0; i--) {
            s += LogService.INDENT_CHAR;
        }
        return s;
    }
}