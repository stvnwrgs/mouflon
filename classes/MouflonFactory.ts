/// <reference path="../definitions/minimist/minimist.d.ts" />

import Paths = require('./Config/Paths');
import Utils = require('./Utils');
import Mouflon = require('./Mouflon');

import ServiceContainer = require('./Service/ServiceContainer');
import DeployConfigService = require('./Service/DeployConfigService');
import LogService = require('./Service/LogService');
import ShellService = require('./Service/ShellService');
import SshService = require('./Service/SshService');
import TransferService = require('./Service/TransferService');

import minimist = require('minimist');
var dateFormat: any = require('dateformat');


class MouflonFactory {

    private static instantiationViaFactory = false;

    paths: Paths;
    projectName: string;
    stageName: string;
    verbose: boolean;

    static createFromArgV() {
        var factory: MouflonFactory,
            arguments;
        if (process.argv.length < 3) {
            Utils.exitWithError('Expecting at least two command line arguments');
        }

        arguments = minimist(process.argv.slice(2));

        MouflonFactory.instantiationViaFactory = true;
        factory = new MouflonFactory(arguments._[0], arguments._[1]);
        MouflonFactory.instantiationViaFactory = false;

        factory.verbose = !!arguments.v;

        return factory;
    }

    constructor(projectName: string, stageName: string) {

        if (!MouflonFactory.instantiationViaFactory) {
            Utils.exitWithError('MouflonFactory cannot be instantiated directly. Use createFromArgV()');
        }

        this.projectName = projectName;
        this.stageName = stageName;

        this.paths = new Paths(
            './temp',
            './settings',
            './config',
            './cache'
        );
    }

    setPaths(paths: {[key:string]:string}): void {
        this.paths.updatePaths(paths);
    }

    createMouflon(): Mouflon {
        var timestamp = dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss');

        var serviceContainer = new ServiceContainer();

        serviceContainer.config = new DeployConfigService(
            this.projectName,
            this.stageName,
            this.paths,
            timestamp,
            serviceContainer);

        serviceContainer.config.verbose = this.verbose;

        serviceContainer.log = new LogService(serviceContainer);
        serviceContainer.shell = new ShellService(serviceContainer);
        serviceContainer.ssh = new SshService(serviceContainer);
        serviceContainer.transfer = new TransferService(timestamp, serviceContainer);


        return new Mouflon(serviceContainer, timestamp);
    }
}

export = MouflonFactory;