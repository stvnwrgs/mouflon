/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
import path = require('path');

import AbstractTask from './../AbstractTask';
import Task from './../Task';
import TaskWithSshClient from "../TaskWithSshClient";
import SshClient from "../../Service/SshClient";

export default class LinkedDirTask extends AbstractTask implements TaskWithSshClient {

    private sshClient:SshClient;

    setSshClient(sshClient:SshClient):void {
        this.sshClient = sshClient;
    }

    execute(): Q.Promise<any> {
        let baseDir    = this.services.transfer.getBaseDir(),
            currentDir = this.services.transfer.getCurrentDir();

        let commands = [
            () => this.services.log.startSection('Making sure linked directories exist on remote')
        ];

        this.getPrefs()['directories'].forEach((directory:string)=> {

            let dir        = path.join(currentDir, directory),
                appDir     = path.join(baseDir, directory);

            commands.push(() => this.sshClient.exec(`if [ ! -d "${appDir}" ]; then mkdir -p -m=0777 ${appDir}; fi`));
            commands.push(() => this.sshClient.exec(`ln -fs ${appDir} ${dir}`));
            commands.push(() => this.sshClient.exec(`chmod 0777 ${dir}`));
        });

        commands.push(() => this.services.log.closeSection('All linked directories exist.'));
        return <Q.Promise<any>> commands.reduce(Q.when, Q(null));
    }
}