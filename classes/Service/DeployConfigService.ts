import AbstractService = require('./AbstractService');
import ServiceContainer = require('./ServiceContainer');

import GlobalConfig = require('./../Config/GlobalConfig');
import ProjectConfig = require('./../Config/ProjectConfig');
import StageConfig = require('./../Config/StageConfig');
import Paths = require('./../Config/Paths');

class DeployConfigService extends AbstractService {

    globalConfig: GlobalConfig;
    projectConfig: ProjectConfig;

    projectName: string;
    stageName: string;
    paths: Paths;
    timestamp: string;

    constructor( projectName: string, stageName: string, paths: Paths, timestamp: string, serviceContainer: ServiceContainer ) {
        super(serviceContainer);

        this.projectName = projectName;
        this.stageName = stageName;
        this.paths = paths;
        this.timestamp = timestamp;
    }

    getStageConfig(): StageConfig {
        return this.projectConfig.stages[this.stageName];
    }
}

export = DeployConfigService;