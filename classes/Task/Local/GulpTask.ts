/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');
import Q = require('q');

class GulpTask extends AbstractTask implements Task {

    execute() {

        var deferred = Q.defer(),
            task = this.getPrefs()['task'] ? ' ' + this.getPrefs()['task'] : '';

        this.services.log.startSection('Executing gulp task' + task);
        this.services.shell.exec('gulp' + task).then(()=> {
                this.services.log.closeSection('Gulp task' + task + ' executed');
                deferred.resolve(true);
            },
            ( error ) => {
                deferred.reject(error);
            });
        return deferred.promise;

    }
}

export = GulpTask;