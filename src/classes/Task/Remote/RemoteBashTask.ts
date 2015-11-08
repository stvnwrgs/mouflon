/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
import path = require('path');

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
        let deferred   = Q.defer(),
            bashSource = path.join(
                this.services.config.paths.getSettings() + 'projects',
                this.services.config.projectName,
                'bash_remote.sh'
            );

        this.services.log.startSection('Executing remote bash commands');

        fs.readFile(bashSource, (err, buffer:Buffer)=> {
            if (err) {
                deferred.reject(err);
                return;
            }

            let content = buffer.toString();

            let commandStrings = content
                .replace("#!/bin/sh", '')
                .split("\n");

            let commands = commandStrings
                .filter(command => command.length > 1)
                .map(command => () => this.sshClient.exec(`cd ${this.services.transfer.getCurrentDir()}; ${command}`));

            commands.reduce(Q.when, Q(null)).then(
                () => {
                    this.services.log.closeSection('All bash commands executed');
                    deferred.resolve(true);
                },
                error => deferred.reject(error));
        });
        return deferred.promise;
    }
}