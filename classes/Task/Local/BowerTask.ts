/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');

import Q = require('q');

class BowerTask extends AbstractTask implements Task {

    execute() {
        var d = Q.defer();

        this.services.log.logStart('Installing bower dependencies');
        this.services.shell.exec('bower install').then(()=> {
            this.services.log.logEnd('Bower packages installed');
            d.resolve(true);
        });
        return d.promise;
    }
}

export = BowerTask;