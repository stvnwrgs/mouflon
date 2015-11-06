/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');


import Q = require('q');
import fs = require('fs');

class RemoteBashTask extends AbstractTask implements Task {

    execute() {
        var d = Q.defer();

        this.services.log.startSection('Executing remote bash commands');

        fs.readFile(this.services.config.paths.getSettings() + 'projects/' + this.services.config.projectName + '/bash_remote.sh', ( err, buffer: Buffer )=> {
            var content: string,
                commands = [],
                commandStrings: string[];
            if (err) {
                d.reject(err);
                return;
            }

            content = '' + buffer;
            commandStrings = content.replace("#!/bin/sh", '').split("\n");
            commandStrings.forEach(( command ) => {
                if (command.length > 1) {

                    this.services.config.getHostsForStage().forEach(host => {

                        var client = this.services.sshClientFactory.getClient(host);

                        commands.push(() => client.exec('cd ' + this.services.transfer.getCurrentDir() + '; ' + command));
                    });

                }
            });

            commands.reduce(Q.when, Q(null)).then(() => {
                this.services.log.closeSection('All bash commands executed');
                d.resolve(true);
            }).fail(( error )=> {
                d.reject(error);
            });
        });
        return d.promise;
    }
}

export = RemoteBashTask;