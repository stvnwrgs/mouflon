/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');
import Q = require('q');

class NodeTask extends AbstractTask implements Task {

    execute() {

        var deferred = Q.defer(),
            task = this.getPrefs()['task'] ? ' ' + this.getPrefs()['task'] : '';

        this.services.log.startSection('Executing grunt task' + task);
        this.services.shell.exec('grunt' + task).then(()=> {
                this.services.log.closeSection('Grunt task' + task + ' executed');
                deferred.resolve(true);
            },
            (error) => {
                deferred.reject(error);
            });
        return deferred.promise;

    }
}

export = NodeTask;