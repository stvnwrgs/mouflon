/// <reference path="../../typings/tsd.d.ts" />
import minimist = require('minimist');
var dateFormat:any = require('dateformat');

import Paths from './Config/Paths';
import Utils from './Utils';
import Mouflon from './Mouflon';
import SshClientFactory from "./Service/SshClientFactory";
import ServiceContainer from './Service/ServiceContainer';
import DeployConfigService from './Service/DeployConfigService';
import LogService from './Service/LogService';
import ShellService from './Service/ShellService';
import TransferService from './Service/TransferService';

export default class MouflonFactory {

    private static instantiationViaFactory = false;

    paths:Paths;
    projectName:string;
    stageName:string;
    verbose:boolean;

    static createFromArgV() {
        let factory:MouflonFactory,
            args;

        if (process.argv.length < 3) {
            Utils.exitWithError('Expecting at least two command line arguments');
        }

        args = minimist(process.argv.slice(2));

        MouflonFactory.instantiationViaFactory = true;
        factory = new MouflonFactory(args._[0], args._[1]);
        MouflonFactory.instantiationViaFactory = false;

        factory.verbose = !!args.v;

        return factory;
    }

    constructor(projectName:string, stageName:string) {

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

    setPaths(paths:{[key:string]:string}):void {
        this.paths.updatePaths(paths);
    }

    createMouflon():Mouflon {
        let timestamp        = dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss'),
            serviceContainer = new ServiceContainer();

        serviceContainer.config = new DeployConfigService(
            this.projectName,
            this.stageName,
            this.paths,
            timestamp,
            serviceContainer);

        serviceContainer.config.verbose = this.verbose;

        serviceContainer.log = new LogService(serviceContainer);
        serviceContainer.shell = new ShellService(serviceContainer);
        serviceContainer.sshClientFactory = new SshClientFactory(serviceContainer);
        serviceContainer.transfer = new TransferService(timestamp, serviceContainer);


        return new Mouflon(serviceContainer, timestamp);
    }
}