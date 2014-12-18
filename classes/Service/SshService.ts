/// <reference path="../../definitions/node/node.d.ts" />
/// <reference path="../../definitions/Q/Q.d.ts" />
/// <reference path="../../definitions/sprintf/sprintf.d.ts" />

import Q = require('q');
import Shell = require('shelljs');
import async = require('async');

import AbstractService = require('./AbstractService');
import SshResult = require('./SshResult');

var VendorSshClient: any = require('node-sshclient');
var color: any = require('cli-color');
var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class SshService extends AbstractService {

    private sshClient: any = null;
    private scpClient: any = null;

    exec(command: string): Q.Promise<SshResult> {
        var deferred = Q.defer<SshResult>(),
            client = this.getSshClient();

        this.services.log.logCommand('SSH cmd: ' + command);

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

        this.services.log.startSection(sprintf('Uploading "%s" to "%s"', filename, remoteFilename));
        this.getScpClient().upload(filename, remoteFilename, (procResult: any) => {
            if (procResult.exitCode !== 0) {
                deferred.reject(procResult.stderr);
                return;
            }
            this.services.log.closeSection('Upload complete');
            deferred.resolve(procResult);
        });
        return deferred.promise;
    }

    private getSshClient(): any {
        var server;

        if (this.sshClient === null) {
            server = this.services.config.getStageConfig().server;
            this.services.log.logCommand(sprintf('Connecting SSH to %s@%s:%s ...', server.user, server.host, server.port));
            this.sshClient = new VendorSshClient.SSH({
                hostname: server.host,
                user:     server.user,
                port:     server.port
            });
        }
        return this.sshClient;
    }

    private getScpClient(): any {
        var server;

        if (this.scpClient === null) {
            server = this.services.config.getStageConfig().server;
            this.services.log.logCommand(sprintf('Connecting SCP to %s@%s:%s ...', server.user, server.host, server.port));
            this.scpClient = new VendorSshClient.SCP({
                hostname: server.host,
                user:     server.user,
                port:     server.port
            })
        }
        return this.scpClient;
    }
}

export = SshService;