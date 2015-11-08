/// <reference path="../../typings/tsd.d.ts" />

import fs = require('fs');

import GlobalConfig from './Config/GlobalConfig';
import Paths from './Config/Paths';
import ServiceContainer from './Service/ServiceContainer';
import Utils from './Utils';
import DeployManager from './DeployManager';
import LogService from "./Service/LogService";

var color:any = require('cli-color');

export default class Mouflon {

    private deployManager:DeployManager;
    private log:LogService;

    constructor(private serviceContainer:ServiceContainer, private timestamp:string) {

        this.deployManager = new DeployManager(serviceContainer);
        this.log = serviceContainer.log;
    }

    deploy() {
        let start           = (new Date()).getTime(),
            deployPromise:Q.IPromise<boolean>,
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
        this.log.debug('Working paths: ' + this.serviceContainer.config.paths.getReadable());

        deployPromise = this.deployManager.deploy();

        deployPromise.then(
            () => {
                let end = (new Date()).getTime(),
                    duration = (0.001 * (end - start)).toFixed(3);
                this.log.closeSection(`It took ${duration}s to deploy "${config.projectName}" to "${config.stageName}". :)` + "\n\n");
            },
            error => Utils.exitWithError(error)
        );
    }

}
