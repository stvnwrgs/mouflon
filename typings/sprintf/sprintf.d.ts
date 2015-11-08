/**
 * @author Alexander Thiel
 */
declare module sPrintF {
    export interface sprintf {
        (fmt: string, ...args: any[]): string
    }
    export interface vsprintf {
        (fmt: string, args: any[]): string;
    }
}