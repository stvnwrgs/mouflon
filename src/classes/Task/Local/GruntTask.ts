/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class GruntTask extends AbstractTask implements Task {

    execute() {

        let deferred = Q.defer(),
            task     = this.getPrefs()['task'] ? ' ' + this.getPrefs()['task'] : '';

        this.services.log.startSection('Executing grunt task' + task);
        this.services.shell.exec('grunt' + task).then(() => {
                this.services.log.closeSection('Grunt task' + task + ' executed');
                deferred.resolve(true);
            },
            error => deferred.reject(error));
        return deferred.promise;

    }
}