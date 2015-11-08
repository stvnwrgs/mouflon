import LogService from './LogService';
import DeployConfigService from './DeployConfigService';
import ShellService from './ShellService';
import SshService from './SshClient';
import SshClientFactory from './SshClientFactory';
import TransferService from './TransferService';

export default class ServiceContainer {
    shell: ShellService;
    log: LogService;
    config: DeployConfigService;
    sshClientFactory: SshClientFactory;
    transfer: TransferService;
}