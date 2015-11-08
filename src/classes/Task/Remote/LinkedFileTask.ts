/// <reference path="../../../../typings/tsd.d.ts" />

var sprintf:sPrintF.sprintf = require('sprintf-js').sprintf;
import Q = require('q');

import AbstractTask from './../AbstractTask';
import Task from './../Task';
import SshClient from "../../Service/SshClient";
import TaskWithSshClient from "../TaskWithSshClient";

export default class LinkedFileTask extends AbstractTask implements TaskWithSshClient {

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