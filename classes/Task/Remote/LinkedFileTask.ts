/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');


import Q = require('q');
import SshClient = require("../../Service/SshClient");
import TaskWithSshClient = require("../TaskWithSshClient");
var sprintf:sPrintF.sprintf = require('sprintf-js').sprintf;

class LinkedFileTask extends AbstractTask implements TaskWithSshClient {

    private sshClient:SshClient;

    setSshClient(sshClient:SshClient):void {
        this.sshClient = sshClient;
    }

    execute():Q.Promise<any> {
        var currentDir = this.services.transfer.getCurrentDir(),
            commands;

        commands = [
            () =>  this.services.log.startSection('Linking files on remote...')
        ];

        this.getPrefs()['files'].forEach((file:string) => {
            commands.push(() => this.sshClient.exec(sprintf('ln -fs ../../%1$s %2$s/%1$s', file, currentDir)));
        });

        commands.push(() => this.services.log.closeSection('All files are linked.'));
        return commands.reduce(Q.when, Q(null));
    }
}

export = LinkedFileTask;