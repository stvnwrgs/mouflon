/// <reference path="../../../../typings/tsd.d.ts" />
import fs = require('fs');
import Q = require('q');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class LocalBashTask extends AbstractTask implements Task {

    execute() {
        var deferred = Q.defer();

        this.services.log.startSection('Executing local bash commands');
        var commands = [];
        fs.readFile(this.services.config.paths.getSettings() + 'projects/' + this.services.config.projectName + '/bash_local.sh', (err, buffer: Buffer)=> {
            var content: string;
            if (err) {
                deferred.reject(err);
                return;
            }

            content = '' + buffer;
            content.replace("#!/bin/sh", '').split("\n").forEach((command) => {
                if (command.length > 1) {
                    commands.push(() => {
                        return this.services.shell.exec(command);
                    });
                }
            });

            commands.reduce(Q.when, Q(null)).then(
                () => {
                    this.services.log.closeSection('All local bash commands executed');
                    deferred.resolve(true);
                },
                (error) => {
                    deferred.reject(error);
                }
            );
        });
        return deferred.promise;
    }
}
