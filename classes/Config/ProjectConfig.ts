import StageConfig = require('./StageConfig');
import TaskDefinition = require('../Task/TaskDefinition');

interface ProjectConfig {
    repo: {
        url: string;
    };
    localTasks: TaskDefinition[];
    remoteTasks: TaskDefinition[];
    stages: {[stageName:string]:StageConfig};
}

export = ProjectConfig;