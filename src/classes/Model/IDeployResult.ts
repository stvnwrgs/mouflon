import ProjectConfig from '../Config/ProjectConfig';

interface IDeployResult {
    project: string;
    stage: string;
    projectConfig: ProjectConfig;
    start: Date;
    end: Date;
}

export default IDeployResult;