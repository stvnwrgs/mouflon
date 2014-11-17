/// <reference path="../../definitions/shelljs/shelljs.d.ts" />
/// <reference path="../../definitions/Q/Q.d.ts" />
/// <reference path="../../definitions/async/async.d.ts" />

import AbstractService = require('./AbstractService');
import DeployConfig = require('./DeployConfigService');
import Q = require('q');
import Shell = require('shelljs');
import async = require('async');

var color: any = require('cli-color');

class ShellService extends AbstractService {

    exec( command: string, global?: boolean ) {
        var deferred = Q.defer();

        if (!global) {
            command = 'cd ' + this.services.config.paths.getTemp() + this.services.config.projectName + '; ' + command;
        }

        //TODO find async shell lib
        async.parallel([
            function () {
                var result;
                console.log('Executing: ' + command);
                result = Shell.exec(command);
                if (result.code === 0) {
                    deferred.resolve(result.output);
                } else {
                    deferred.reject(result.output);
                }
            }
        ]);

        return deferred.promise;
    }
}

export = ShellService;