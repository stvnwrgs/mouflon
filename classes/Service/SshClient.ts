/// <reference path="../../definitions/node/node.d.ts" />
/// <reference path="../../definitions/Q/Q.d.ts" />
/// <reference path="../../definitions/sprintf/sprintf.d.ts" />

import Q = require('q');
import Shell = require('shelljs');
import async = require('async');

import AbstractService = require('./AbstractService');
import SshResult = require('./SshResult');
import LogService = require("./LogService");

var VendorSshClient: any = require('node-sshclient');
var color: any = require('cli-color');
var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class SshClient  {

    private sshClient: any = null;
    private scpClient: any = null;

    constructor (private host: string,
                 private port: number,
                 private user: string,
                 private log: LogService) {

    }

    exec(command: string): Q.Promise<SshResult> {
        var deferred = Q.defer<SshResult>(),
            client = this.getSshClient();

        this.log.logCommand('SSH cmd: ' + command);

        client.command(command, (procResult: SshResult) => {
            var resultString = sprintf('Response (code %s): "%s", err: "%s"', procResult.exitCode, procResult.stdout, procResult.stderr);
            if (procResult.exitCode !== 0) {
                deferred.reject(resultString);
            } else {
                //this.services.log.logResult(resultString);
                deferred.resolve(procResult);
            }
        });

        return deferred.promise;
    }

    upload(filename: string, remoteFilename: string) {
        var deferred = Q.defer();

        this.log.startSection(sprintf('Uploading "%s" to "%s"', filename, remoteFilename));
        this.getScpClient().upload(filename, remoteFilename, (procResult: any) => {
            if (procResult.exitCode !== 0) {
                deferred.reject(procResult.stderr);
                return;
            }
            this.log.closeSection('Upload complete');
            deferred.resolve(procResult);
        });
        return deferred.promise;
    }

    private getSshClient(): any {

        if (this.sshClient === null) {
            this.log.logCommand(sprintf('Connecting SSH to %s@%s:%s ...', this.user, this.host, this.port));
            this.sshClient = new VendorSshClient.SSH({
                hostname: this.host,
                user:     this.user,
                port:     this.port
            });
        }
        return this.sshClient;
    }

    private getScpClient(): any {

        if (this.scpClient === null) {
            this.log.logCommand(sprintf('Connecting SCP to %s@%s:%s ...', this.user, this.host, this.port));
            this.scpClient = new VendorSshClient.SCP({
                hostname: this.host,
                user:     this.user,
                port:     this.port
            })
        }
        return this.scpClient;
    }
}

export = SshClient;