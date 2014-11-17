/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');

import Q = require('q');

class NodeTask extends AbstractTask implements Task {

    execute() {

        var d = Q.defer();

        this.services.log.logStart('Installing node packages');
        this.services.shell.exec('npm install').then(() => {
            this.services.log.logEnd('Node packages installed');
            d.resolve(true);
        }).fail(function ( error ) {
            d.reject(error);
        });
        return d.promise;

    }
}

export = NodeTask;