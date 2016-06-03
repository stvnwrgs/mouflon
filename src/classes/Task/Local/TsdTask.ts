/// <reference path="../../../../typings/index.d.ts" />

import Q = require('q');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class TsdTask extends AbstractTask implements Task {

    execute() {

        let deferred = Q.defer();

        this.services.log.startSection('Updating typescript definitions');
        this.services.shell.exec('tsd reinstall -so').then(()=> {
                this.services.log.closeSection('Type script definitions updated');
                deferred.resolve(true);
            },
            error => deferred.reject(error));
        return deferred.promise;
    }
}