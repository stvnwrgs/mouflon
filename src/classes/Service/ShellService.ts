/// <reference path="../../../typings/tsd.d.ts" />

import AbstractService from './AbstractService';
import DeployConfig from './DeployConfigService';
import Q = require('q');
import Shell = require('shelljs');
import async = require('async');

var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

export default class ShellService extends AbstractService {

    exec(command: string, global?: boolean): Q.Promise<string> {
        var deferred = Q.defer<string>(),
            result;

        if (!global) {
            command = sprintf('cd %s%s; %s', this.services.config.paths.getTemp(), this.services.config.projectName, command);
        }
        this.services.log.debug('Executing: ' + command);
        result = Shell.exec(command, {
            silent: !this.services.config.verbose
        });
        if (result.code === 0) {
            deferred.resolve(result.output);
        } else {
            deferred.reject(result.output);
        }

        return deferred.promise;
    }
}