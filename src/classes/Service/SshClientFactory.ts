/// <reference path="../../../typings/index.d.ts" />

import AbstractService from './AbstractService';
import SshClient from "./SshClient";

export default class SshClientFactory extends AbstractService {

    private clientsForHost:{[hostName:string]:SshClient} = {};

    getClient(hostName:string):SshClient {
        if (undefined === this.clientsForHost[hostName]) {
            let server = this.services.config.getStageConfig().server;
            this.clientsForHost[hostName] = new SshClient(hostName, server.port, server.user, this.services.log);

        }
        return this.clientsForHost[hostName];
    }
}