/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
var sprintf:sPrintF.sprintf = require('sprintf-js').sprintf;

import AbstractTask from './../AbstractTask';
import Task from './../Task';


export default class NodeTask extends AbstractTask implements Task {

    execute() {

        var deferred = Q.defer(),
            filename = sprintf('%s/%s/package.json', this.services.config.paths.getTemp(), this.services.config.projectName);

        fs.readFile(filename, (err, settingsBuffer:Buffer) => {

            var info = JSON.parse(settingsBuffer + ''),
                dependencyCount,
                devDependencyCount;

            if (err) {
                this.services.log.warn('package.json not present');

            } else {
                dependencyCount = info.dependencies ? Object.keys(info.dependencies).length : 0;
                devDependencyCount = info.devDependencies ? Object.keys(info.devDependencies).length : 0;

                if (dependencyCount > 0 || devDependencyCount > 0) {
                    this.services.log.startSection(sprintf('Installing %d npm dependencies (%d dev)', dependencyCount, devDependencyCount));
                } else {
                    this.services.log.startSection('Installing npm dependencies');
                    this.services.log.warn('package.json contains neither dependencies nor devDependencies');
                }
            }

            this.services.shell.exec('npm install').then(() => {
                this.services.log.closeSection('Node packages installed');
                deferred.resolve(true);
            }).fail(function (error) {
                deferred.reject(error);
            });

        });
        return deferred.promise;

    }
}