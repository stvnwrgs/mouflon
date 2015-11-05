import LogService = require('./LogService');
import DeployConfigService = require('./DeployConfigService');
import ShellService = require('./ShellService');
import SshService = require('./SshClient');
import SshClientFactory = require('./SshClientFactory');
import TransferService = require('./TransferService');

class ServiceContainer {
    shell: ShellService;
    log: LogService;
    config: DeployConfigService;
    sshClientFactory: SshClientFactory;
    transfer: TransferService;
}

export = ServiceContainer;