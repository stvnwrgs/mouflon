/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');


import Q = require('q');
import fs = require('fs');

class LinkedDirTask extends AbstractTask implements Task {

    execute() {
        var baseDir = this.services.transfer.getBaseDir(),
            currentDir = this.services.transfer.getCurrentDir(),
            commands = [];

        this.services.log.logStart('Making sure linked directories exist on remote');

        this.getPrefs()['directories'].forEach(( directory: string )=> {
            commands.push(()=> {
                return this.services.ssh.exec('if [ ! -d "' + baseDir + '/' + directory + '" ]; then mkdir -m=0777 ' + baseDir + '/' + directory + '; fi');
            });
            commands.push(()=> {
                return this.services.ssh.exec('ln -fs ../../' + directory + ' ' + currentDir + '/' + directory);
            });
            commands.push(()=> {
                return this.services.ssh.exec('chmod 0777 ' + currentDir + '/' + directory);
            });
        });

        return commands.reduce(Q.when, Q(null));
    }
}

export = LinkedDirTask;