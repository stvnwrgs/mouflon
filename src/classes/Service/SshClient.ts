/// <reference path="../../../typings/index.d.ts" />

import Q = require('q');
var VendorSshClient:any = require('node-sshclient');

import AbstractService from './AbstractService';
import SshResult from './SshResult';
import LogService from "./LogService";

export default class SshClient {

    private sshClient:any = null;
    private scpClient:any = null;

    constructor(private host:string,
                private port:number,
                private user:string,
                private log:LogService) {

    }

    getHost():string {
        return this.host;
    }

    exec(command:string):Q.Promise<SshResult> {
        let deferred = Q.defer<SshResult>(),
            client   = this.getSshClient();

        this.log.logCommand('SSH cmd: ' + command);

        client.command(command, (procResult:SshResult) => {
            let resultString = `Response (code ${procResult.exitCode}): "${procResult.stdout}", err: "${procResult.stderr}"`;
            if (procResult.exitCode !== 0) {
                deferred.reject(resultString);
            } else {
                //this.services.log.logResult(resultString);
                deferred.resolve(procResult);
            }
        });

        return deferred.promise;
    }

    upload(filename:string, remoteFilename:string) {
        let deferred = Q.defer();

        this.log.startSection(`Uploading "${filename}" to "${remoteFilename}"`);
        this.getScpClient().upload(filename, remoteFilename, (procResult:any) => {
            if (procResult.exitCode !== 0) {
                deferred.reject(procResult.stderr);
                return;
            }
            this.log.closeSection('Upload complete');
            deferred.resolve(procResult);
        });
        return deferred.promise;
    }

    private getSshClient():any {

        if (this.sshClient === null) {
            this.log.logCommand(`Connecting SSH to ${this.user}@${this.host}:${this.port} ...`);
            this.sshClient = new VendorSshClient.SSH({
                hostname: this.host,
                user:     this.user,
                port:     this.port
            });
        }
        return this.sshClient;
    }

    private getScpClient():any {
        if (this.scpClient === null) {
            this.log.logCommand(`Connecting SCP to ${this.user}@${this.host}:${this.port} ...`);
            this.scpClient = new VendorSshClient.SCP({
                hostname: this.host,
                user:     this.user,
                port:     this.port
            })
        }
        return this.scpClient;
    }
}
