import ProjectConfig from '../Config/ProjectConfig';
import GlobalConfig from '../Config/GlobalConfig';

interface IDeployResult {
    project: string;
    stage: string;
    projectConfig: ProjectConfig;
    globalConfig: GlobalConfig;
    start: any;
    end: any;
}

export default IDeployResult;