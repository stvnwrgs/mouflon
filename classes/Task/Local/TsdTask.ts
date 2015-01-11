/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');
import Q = require('q');

class TsdTask extends AbstractTask implements Task {

    execute() {

        var deferred = Q.defer();

        this.services.log.startSection('Updating typescript definitions');
        this.services.shell.exec('tsd reinstall -so').then(()=> {
                this.services.log.closeSection('Type script definitions updated');
                deferred.resolve(true);
            },
            ( error ) => {
                deferred.reject(error);
            });
        return deferred.promise;
    }
}

export = TsdTask;