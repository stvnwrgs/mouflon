/// <reference path="../../typings/index.d.ts" />

import fs = require('fs');
import Q = require('q');

import GlobalConfig from './Config/GlobalConfig';
import PathConfig from './Config/PathConfig';
import ServiceContainer from './Service/ServiceContainer';
import Utils from './Utils';
import DeployManager from './DeployManager';
import LogService from './Service/LogService';
import IDeployResult from './Model/IDeployResult' ;

var color:any = require('cli-color');

export default class Mouflon {

    private deployManager:DeployManager;
    private log:LogService;

    constructor(private serviceContainer:ServiceContainer, private timestamp:string) {

        this.deployManager = new DeployManager(serviceContainer);
        this.log = serviceContainer.log;
    }

    deploy():Q.IPromise<IDeployResult> {
        let start           = new Date().getTime(),
            deployPromise = Q.defer<IDeployResult>(),
            deployManagerPromise:Q.IPromise<boolean>,
            config          = this.serviceContainer.config,
            packageData:any = JSON.parse('' + fs.readFileSync(__dirname + '/../../package.json'));

        this.log.logAndKeepColors(
            color.yellow(
                "\n\n+----------------------------------------------------+" +
                "\n|      ") + color.xterm(200).bold('Mouflon - your deployment manager') + ' ' + ('        v' + packageData.version).substr(-10, 10) + color.yellow("  |" +
                "\n+----------------------------------------------------+") +
            "\n\n");

        this.log.startSection(`Deploying "${config.projectName}" to "${config.stageName}"...`);
        this.log.debug('Timestamp is ' + color.whiteBright.bold(this.timestamp));
        if (this.serviceContainer.config.verbose) {
            this.log.debug('Verbose mode is enabled');
        }
        this.log.debug('Working pathConfig: ' + this.serviceContainer.config.pathConfig.getReadable());

        return this.deployManager.deploy().then(() => {
            let result: IDeployResult = {
                project: config.projectName,
                stage: config.stageName,
                projectConfig: this.serviceContainer.config.projectConfig,
                start: new Date(),
                end: new Date(),
            };
            return result;
        });
    }
}
