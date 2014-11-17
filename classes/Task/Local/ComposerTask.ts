/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');

import Q = require('q');

class ComposerTask extends AbstractTask implements Task {

    execute() {
        var d = Q.defer();
        this.services.log.logStart('Installing composer dependencies');
        this.services.shell.exec(this.services.config.globalConfig.composer.command + ' install --optimize-autoloader').then(( stdout ) => {
            this.services.log.logEnd('Composer dependencies installed');
            d.resolve(true);
        }).fail(function ( error ) {
            d.reject(error);
        });
        return d.promise;

    }
}

export = ComposerTask ;