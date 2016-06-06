/// <reference path="../../../../typings/index.d.ts" />

import Q = require('q');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class GulpTask extends AbstractTask implements Task {

    execute() {

        let deferred = Q.defer(),
            task     = this.getPrefs()['task'] ? ' ' + this.getPrefs()['task'] : '';

        this.services.log.startSection('Executing gulp task' + task);
        this.services.shell.exec('gulp' + task).then(()=> {
                this.services.log.closeSection('Gulp task' + task + ' executed');
                deferred.resolve(true);
            },
            error => deferred.reject(error));
        return deferred.promise;

    }
}