/// <reference path="../../../../typings/tsd.d.ts" />

import Q = require('q');
import fs = require('fs');
import path = require('path');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class NodeTask extends AbstractTask implements Task {

    execute() {

        let deferred = Q.defer(),
            filename = path.join(this.services.config.pathConfig.getTemp(), this.services.config.projectName, 'package.json');

        fs.readFile(filename, (err, settingsBuffer:Buffer) => {

            let info = JSON.parse(settingsBuffer + '');

            if (err) {
                this.services.log.warn('package.json not present');

            } else {
                let dependencyCount = info.dependencies ? Object.keys(info.dependencies).length : 0;
                let devDependencyCount = info.devDependencies ? Object.keys(info.devDependencies).length : 0;

                if (dependencyCount > 0 || devDependencyCount > 0) {
                    this.services.log.startSection(`Installing ${dependencyCount} npm dependencies (${devDependencyCount} dev)`);
                } else {
                    this.services.log.startSection('Installing npm dependencies');
                    this.services.log.warn('package.json contains neither dependencies nor devDependencies');
                }
            }

            this.services.shell.exec('npm install').then(() => {
                this.services.log.closeSection('Node packages installed');
                deferred.resolve(true);
            }).fail(error => deferred.reject(error));

        });
        return deferred.promise;

    }
}