/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class ComposerTask extends AbstractTask implements Task {

    execute() {
        var d = Q.defer(),
            filename = sprintf('%s/%s/composer.json', this.services.config.paths.getTemp(), this.services.config.projectName);

        fs.readFile(filename, (err, settingsBuffer: Buffer) => {

            var info = JSON.parse(settingsBuffer + '');

            if (err) {
                this.services.log.startSection('Installing composer dependencies');
                this.services.log.warn('composer.json not present');
            } else {
                this.services.log.startSection(sprintf('Installing %d composer dependencies', Object.keys(info.require).length));
            }

            this.services.shell.exec(this.services.config.globalConfig.composer.command + ' install --optimize-autoloader').then((stdout) => {
                this.services.log.closeSection('Composer dependencies installed');
                d.resolve(true);
            }).fail(function (error) {
                d.reject(error);
            });
        });
        return d.promise;

    }
}