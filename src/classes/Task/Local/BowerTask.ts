/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

import AbstractTask from './../AbstractTask';
import Task from './../Task';


export default class BowerTask extends AbstractTask implements Task {

    execute(): Q.Promise<boolean> {
        var deferred = Q.defer<boolean>(),
            filename = sprintf('%s/%s/bower.json', this.services.config.paths.getTemp(), this.services.config.projectName);

        fs.readFile(filename, (err, settingsBuffer: Buffer) => {

            var info = JSON.parse(settingsBuffer + '');

            if (err) {
                this.services.log.warn('bower.json not present');
            } else {
                this.services.log.startSection(sprintf('Installing %d bower dependencies', Object.keys(info.dependencies).length));
            }

            this.services.shell.exec('bower install').then(
                ()=> {
                    this.services.log.closeSection('Bower packages installed');
                    deferred.resolve(true);
                },
                (error) => {
                    deferred.reject(error);
                });
        });

        return deferred.promise;
    }
}