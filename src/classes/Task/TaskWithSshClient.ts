import SshClient from "../Service/SshClient";
import Task from "./Task";

interface TaskWithSshClient extends Task {

    setSshClient(sshClient:SshClient):void
}

export default TaskWithSshClient;