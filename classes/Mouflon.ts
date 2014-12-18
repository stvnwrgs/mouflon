/// <reference path="../definitions/Q/Q.d.ts" />

import fs = require('fs');

import GlobalConfig = require('./Config/GlobalConfig');
import Paths = require('./Config/Paths');

import DeployConfig = require('./Service/DeployConfigService');
import ServiceContainer = require('./Service/ServiceContainer');
import LogService = require('./Service/LogService');
import ShellService = require('./Service/ShellService');
import SshService = require('./Service/SshService');
import TransferService = require('./Service/TransferService');

import Utils = require('./Utils');
import DeployManager = require('./DeployManager');

var color: any = require('cli-color');
var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class Mouflon {

    private deployManager: DeployManager;
    private serviceContainer: ServiceContainer;
    private timestamp: string;

    constructor(projectName: string, stageName: string, paths: Paths, timestamp: string) {

        var serviceContainer = new ServiceContainer();

        serviceContainer.config = new DeployConfig(projectName, stageName, paths, timestamp, serviceContainer);
        serviceContainer.log = new LogService(serviceContainer);
        serviceContainer.shell = new ShellService(serviceContainer);
        serviceContainer.ssh = new SshService(serviceContainer);
        serviceContainer.transfer = new TransferService(timestamp, serviceContainer);

        this.serviceContainer = serviceContainer;
        this.deployManager = new DeployManager(serviceContainer);
        this.timestamp = timestamp;
    }

    deploy() {
        var deployPromise: Q.Promise<boolean>,
            config = this.serviceContainer.config,
            packageData: any = JSON.parse('' + fs.readFileSync(__dirname + '/../../package.json'));

        this.serviceContainer.log.logAndKeepColors(
            color.yellow(
                "\n\n+----------------------------------------------------+" +
                "\n|      ") + color.xterm(200).bold('Mouflon - your deployment manager') + ' ' + ('        v' + packageData.version).substr(-10, 10) + color.yellow("  |" +
            "\n+----------------------------------------------------+") +
            "\n\n");

        this.serviceContainer.log.info(sprintf('Deploying "%s" to "%s"...', config.projectName, config.stageName));
        this.serviceContainer.log.debug('Timestamp is ' + color.whiteBright.bold(this.timestamp));
        this.serviceContainer.log.debug('Working paths: ' + this.serviceContainer.config.paths.getReadable());

        deployPromise = this.deployManager.deploy();

        deployPromise.then(() => {
            this.serviceContainer.log.closeSection("\n\n" + config.projectName + ' has been deployed to "' + config.stageName + '". :)' + "\n\n");
        });

        deployPromise.fail((error) => {
            Utils.exitWithError(error);
        });
    }

}

export = Mouflon;