import LogService = require('./LogService');
import DeployConfigService = require('./DeployConfigService');
import ShellService = require('./ShellService');
import SshService = require('./SshService');
import TransferService = require('./TransferService');

class ServiceContainer {
    shell: ShellService;
    log: LogService;
    config: DeployConfigService;
    ssh: SshService;
    transfer: TransferService;
}

export = ServiceContainer;