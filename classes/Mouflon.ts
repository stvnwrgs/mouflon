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

class Mouflon {

    private deployManager: DeployManager;
    private serviceContainer: ServiceContainer;

    constructor( projectName: string, stageName: string, paths: Paths, timestamp: string ) {

        console.log('Timestamp is ' + timestamp);

        var serviceContainer = new ServiceContainer();
        serviceContainer.config = new DeployConfig(projectName, stageName, paths, timestamp, serviceContainer);
        serviceContainer.log = new LogService(serviceContainer);
        serviceContainer.shell = new ShellService(serviceContainer);
        serviceContainer.ssh = new SshService(serviceContainer);
        serviceContainer.transfer = new TransferService(timestamp, serviceContainer);

        this.serviceContainer = serviceContainer;
        this.deployManager = new DeployManager(serviceContainer);
    }

    deploy() {
        var deployPromise: Q.Promise<boolean>,
            config = this.serviceContainer.config,
            packageData: any = JSON.parse('' + fs.readFileSync(__dirname + '/../../package.json'));

        console.log(
            color.yellow(
                "\n+---------------------------------------------------+" +
                "\n|    ") + color.xterm(200).bold('Mouflon - your deployment manager') + ' - v' + packageData.version + color.yellow("     |" +
            "\n+---------------------------------------------------+") +
            "\n" +
            "\n" + 'Deploying "' + config.projectName + '" to "' + config.stageName + '".' +
            "\n");

        deployPromise = this.deployManager.deploy();

        deployPromise.then(() => {
            this.serviceContainer.log.logEnd("\n\n" + config.projectName + ' has been deployed to "' + config.stageName + '". :)' + "\n\n");
        });

        deployPromise.fail(( error ) => {
            Utils.exitWithError(error);
        });
    }

}

export = Mouflon;