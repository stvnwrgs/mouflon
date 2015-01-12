import StageConfig = require('./StageConfig');
import TaskDefinition = require('../Task/TaskDefinition');

interface ProjectConfig {
    repo: {
        url: string;
        submodules: boolean;
    };
    localTasks: TaskDefinition[];
    remoteTasks: TaskDefinition[];
    stages: {[stageName:string]:StageConfig};
}

export = ProjectConfig;