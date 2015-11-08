/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
import path= require('path');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class BowerTask extends AbstractTask implements Task {

    execute():Q.Promise<boolean> {
        let deferred = Q.defer<boolean>(),
            filename = path.join(this.services.config.paths.getTemp(), this.services.config.projectName, 'bower.json');

        fs.readFile(filename, (err, settingsBuffer:Buffer) => {

            let info = JSON.parse(settingsBuffer.toString());

            if (err) {
                this.services.log.warn('bower.json not present');
            } else {
                this.services.log.startSection(`Installing ${Object.keys(info.dependencies).length} bower dependencies`);
            }

            this.services.shell.exec('bower install').then(
                () => {
                    this.services.log.closeSection('Bower packages installed');
                    deferred.resolve(true);
                },
                error => deferred.reject(error));
        });

        return deferred.promise;
    }
}