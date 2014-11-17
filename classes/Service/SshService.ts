/// <reference path="../../definitions/node/node.d.ts" />
/// <reference path="../../definitions/Q/Q.d.ts" />

import Q = require('q');
import Shell = require('shelljs');
import async = require('async');

import AbstractService = require('./AbstractService');
import SshResult = require('./SshResult');

var VendorSshClient: any = require('node-sshclient');
var color: any = require('cli-color');

class SshService extends AbstractService {

    private sshClient: any = null;
    private scpClient: any = null;

    exec( command: string ) {
        var deferred = Q.defer();

        console.log(color.white('Executing via SSH: ' + command));

        this.getSshClient().command(command, function ( procResult: SshResult ) {
            var resultString = 'Response (code ' + procResult.exitCode + '): "' + procResult.stdout + '"';
            if (procResult.exitCode !== 0) {
                deferred.reject(resultString);
            } else {
                console.log(color.blackBright(resultString));
                deferred.resolve(procResult);
            }
        });

        return deferred.promise;
    }

    upload( filename: string, remoteFilename: string ) {
        var deferred = Q.defer();

        console.log(color.white('Uploading "' + filename + '" to "' + remoteFilename + '"'));
        this.getScpClient().upload(filename, remoteFilename, function ( procResult: any ) {
            if (procResult.exitCode !== 0) {
                deferred.reject(procResult.stderr);
                return;
            }
            console.log(color.blackBright('Upload complete'));
            deferred.resolve(procResult);
        });
        return deferred.promise;
    }

    private getSshClient(): any {
        var server;

        if (this.sshClient === null) {
            server = this.services.config.getStageConfig().server;
            console.log(color.white('Connecting SSH to ' + server.user + '@' + server.host + ':' + server.port + ' ...'));
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
            console.log(color.white('Connecting SCP to ' + server.user + '@' + server.host + ':' + server.port + ' ...'));
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