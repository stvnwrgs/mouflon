import AbstractService = require('./AbstractService');
import ServiceContainer = require('./ServiceContainer');

import GlobalConfig = require('./../Config/GlobalConfig');
import ProjectConfig = require('./../Config/ProjectConfig');
import StageConfig = require('./../Config/StageConfig');
import Paths = require('./../Config/Paths');

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
        return this.projectConfig.stages[this.stageName];
    }

    getHostsForStage():string[] {
        if (this.getStageConfig().server.host) {

            this.services.log.warn('Utilization of stage.host:string is deprecated. Use stage.hosts:string[] instead');

            return [this.getStageConfig().server.host];
        }
        return this.getStageConfig().server.hosts;
    }

}

export = DeployConfigService;