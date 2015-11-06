import SshClient = require("../Service/SshClient");
import Task = require("./Task");

interface TaskWithSshClient extends Task {

    setSshClient(sshClient:SshClient):void
}

export = TaskWithSshClient;