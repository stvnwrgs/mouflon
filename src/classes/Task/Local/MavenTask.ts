/// <reference path="../../../../typings/index.d.ts" />

import Q = require('q');

import AbstractTask from './../AbstractTask';
import Task from './../Task';

export default class MavenTask extends AbstractTask implements Task {

    execute() {

        let deferred = Q.defer();

        this.services.log.startSection('Executing maven targets...');
        let mvnTargets = this.getPrefs()['targets'];

        let shellPromise = Q({});
        mvnTargets.forEach((mvnTarget:string) => {

            shellPromise = shellPromise.then((x:any) => {

                return this.services.shell.exec('mvn ' + mvnTarget).then(() => {

                    this.services.log.info(`Executed maven target ${mvnTarget}.`);
                    return {};
                });
            });
        });

        shellPromise.then(()=> {
                this.services.log.closeSection('Maven targets executed.');
                deferred.resolve(true);
            },
            error => deferred.reject(error));

        return deferred.promise;
    }
}
