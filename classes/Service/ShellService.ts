/// <reference path="../../definitions/shelljs/shelljs.d.ts" />
/// <reference path="../../definitions/Q/Q.d.ts" />
/// <reference path="../../definitions/async/async.d.ts" />

import AbstractService = require('./AbstractService');
import DeployConfig = require('./DeployConfigService');
import Q = require('q');
import Shell = require('shelljs');
import async = require('async');

var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class ShellService extends AbstractService {

    exec(command: string, global?: boolean): Q.Promise<string> {
        var deferred = Q.defer<string>(),
            result;

        if (!global) {
            command = sprintf('cd %s%s; %s', this.services.config.paths.getTemp(), this.services.config.projectName, command);
        }
        this.services.log.debug('Executing: ' + command);
        result = Shell.exec(command, {
            silent: true
        });
        if (result.code === 0) {
            deferred.resolve(result.output);
        } else {
            deferred.reject(result.output);
        }

        return deferred.promise;
    }
}

export = ShellService;