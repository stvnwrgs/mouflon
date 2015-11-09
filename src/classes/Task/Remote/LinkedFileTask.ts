/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import path = require('path');

import AbstractTask from './../AbstractTask';
import Task from './../Task';
import SshClient from "../../Service/SshClient";
import TaskWithSshClient from "../TaskWithSshClient";

export default class LinkedFileTask extends AbstractTask implements TaskWithSshClient {

    private sshClient:SshClient;

    setSshClient(sshClient:SshClient):void {
        this.sshClient = sshClient;
    }

    execute(): Q.Promise<any> {
        let baseDir    = this.services.transfer.getBaseDir();
        let currentDir = this.services.transfer.getCurrentDir();

        let commands = [
            () =>  this.services.log.startSection('Linking files on remote...')
        ];

        this.getPrefs()['files'].forEach((file:string) => {
            let linkSource = path.join(baseDir, file),
                linkTarget = path.join(currentDir, file);
            commands.push(() => this.sshClient.exec(`ln -fs ${linkSource} ${linkTarget}`));
        });

        commands.push(() => this.services.log.closeSection('All files are linked.'));
        return <Q.Promise<any>> commands.reduce(Q.when, Q(null));
    }
}