/// <reference path="../definitions/Q/Q.d.ts" />

import fs = require('fs');

import GlobalConfig = require('./Config/GlobalConfig');
import Paths = require('./Config/Paths');

import ServiceContainer = require('./Service/ServiceContainer');

import Utils = require('./Utils');
import DeployManager = require('./DeployManager');
import LogService = require("./Service/LogService");

var color:any = require('cli-color');
var sprintf:sPrintF.sprintf = require('sprintf-js').sprintf;

class Mouflon {

    private deployManager:DeployManager;
    private log:LogService;

    constructor(private serviceContainer:ServiceContainer, private timestamp:string) {

        this.deployManager = new DeployManager(serviceContainer);
        this.log = serviceContainer.log;
    }

    deploy() {
        var start           = (new Date()).getTime(),
            deployPromise:Q.IPromise<boolean>,
            config          = this.serviceContainer.config,
            packageData:any = JSON.parse('' + fs.readFileSync(__dirname + '/../../package.json'));

        this.log.logAndKeepColors(
            color.yellow(
                "\n\n+----------------------------------------------------+" +
                "\n|      ") + color.xterm(200).bold('Mouflon - your deployment manager') + ' ' + ('        v' + packageData.version).substr(-10, 10) + color.yellow("  |" +
                "\n+----------------------------------------------------+") +
            "\n\n");

        this.log.startSection(sprintf('Deploying "%s" to "%s"...', config.projectName, config.stageName));
        this.log.debug('Timestamp is ' + color.whiteBright.bold(this.timestamp));
        if (this.serviceContainer.config.verbose) {
            this.log.debug('Verbose mode is enabled');
        }
        this.log.debug('Working paths: ' + this.serviceContainer.config.paths.getReadable());

        deployPromise = this.deployManager.deploy();

        deployPromise.then(
            () => {
                var end = (new Date()).getTime();
                this.log.closeSection(sprintf(
                    'It took %ss to deploy "%s" to "%s". :)' + "\n\n",
                    (0.001 * (end - start)).toFixed(3),
                    config.projectName,
                    config.stageName
                ));
            },
            error => Utils.exitWithError(error)
        );
    }

}

export = Mouflon;