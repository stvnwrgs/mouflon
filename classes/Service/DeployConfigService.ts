import AbstractService = require('./AbstractService');
import ServiceContainer = require('./ServiceContainer');

import GlobalConfig = require('./../Config/GlobalConfig');
import ProjectConfig = require('./../Config/ProjectConfig');
import StageConfig = require('./../Config/StageConfig');
import Paths = require('./../Config/Paths');
import Utils = require("../Utils");

class DeployConfigService extends AbstractService {

    globalConfig:GlobalConfig;
    projectConfig:ProjectConfig;

    verbose:boolean;

    constructor(public projectName:string,
                public stageName:string,
                public paths:Paths,
                public timestamp:string,
                serviceContainer:ServiceContainer) {
        super(serviceContainer);

    }

    getStageConfig():StageConfig {

        if (!this.projectConfig) {
            this.services.log.error('No project configuration found');
        }
        if (!this.projectConfig.stages) {
            this.services.log.error('No stages found');
            this.services.log.error(JSON.stringify(this.projectConfig, null, 4));
        }
        if (!this.projectConfig.stages[this.stageName]) {
            this.services.log.error('Stage "' + this.stageName + '" not found');
            this.services.log.error(JSON.stringify(this.projectConfig, null, 4));
        }

        return this.projectConfig.stages[this.stageName];
    }

    getHostsForStage():string[] {

        if (this.getStageConfig().server.host) {
            this.services.log.warn('Utilization of stage.host:string is deprecated. Use stage.hosts:string[] instead');
            return [this.getStageConfig().server.host];
        }
        if (!this.getStageConfig().server.hosts || !this.getStageConfig().server.hosts.forEach) {
            Utils.exitWithError('No hosts:string[] specified for stage "' + this.stageName + '".')
        }
        return this.getStageConfig().server.hosts;
    }
}

export = DeployConfigService;