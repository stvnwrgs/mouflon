/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');


import Q = require('q');
import fs = require('fs');
var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class LinkedDirTask extends AbstractTask implements Task {

    execute() {
        var baseDir = this.services.transfer.getBaseDir(),
            currentDir = this.services.transfer.getCurrentDir(),
            commands;

        commands = [
            () => { this.services.log.startSection('Making sure linked directories exist on remote'); }
        ];

        this.services.config.getHostsForStage().forEach(host => {

            let client = this.services.sshClientFactory.getClient(host);

            this.getPrefs()['directories'].forEach((directory: string)=> {
                commands.push(() => {
                    return client.exec(sprintf('if [ ! -d "%1$s/%2$s" ]; then mkdir -m=0777 %1$s/%2$s; fi', baseDir, directory));
                });
                commands.push(() => {
                    return client.exec(sprintf('ln -fs ../../%1$s %2$s/%1$s', directory, currentDir));
                });
                commands.push(() => {
                    return client.exec(sprintf('chmod 0777 %s/%s', currentDir, directory));
                });
            });
        });

        commands.push(() => { this.services.log.closeSection('All linked directories exist.'); });
        return commands.reduce(Q.when, Q(null));
    }
}

export = LinkedDirTask;