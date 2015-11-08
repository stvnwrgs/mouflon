/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');

import AbstractTask from './../AbstractTask';
import Task from './../Task';
import TaskWithSshClient from "../TaskWithSshClient";
import SshClient from "../../Service/SshClient";

export default class RemoteBashTask extends AbstractTask implements TaskWithSshClient {

    private sshClient:SshClient;

    setSshClient(sshClient:SshClient):void {
        this.sshClient = sshClient;
    }

    execute() {
        var d = Q.defer();

        this.services.log.startSection('Executing remote bash commands');

        fs.readFile(this.services.config.paths.getSettings() + 'projects/' + this.services.config.projectName + '/bash_remote.sh', (err, buffer:Buffer)=> {
            var content:string,
                commands = [],
                commandStrings:string[];
            if (err) {
                d.reject(err);
                return;
            }

            content = '' + buffer;
            commandStrings = content.replace("#!/bin/sh", '').split("\n");
            commandStrings.forEach((command) => {
                if (command.length > 1) {
                    commands.push(() => this.sshClient.exec('cd ' + this.services.transfer.getCurrentDir() + '; ' + command));
                }
            });

            commands.reduce(Q.when, Q(null)).then(() => {
                this.services.log.closeSection('All bash commands executed');
                d.resolve(true);
            }).fail((error)=> {
                d.reject(error);
            });
        });
        return d.promise;
    }
}