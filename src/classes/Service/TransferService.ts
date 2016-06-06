/// <reference path="../../../typings/index.d.ts" />

import Q = require('q');

import ServiceContainer from './ServiceContainer';
import AbstractService from './AbstractService';
import SshResult from './SshResult';
import SshClient from "./SshClient";

export default class TransferService extends AbstractService {

    private baseDir:string = null;
    private currentDir:string = null;

    constructor(private timestamp:string,
                serviceContainer:ServiceContainer) {
        super(serviceContainer);
    }

    transfer(sshClient:SshClient, configPresent:boolean):Q.IPromise<any> {

        let successPromise;

        this.services.log.startSection('Transferring project to remote "' + sshClient.getHost() + '"');

        successPromise = [
            () => this.makeReleasesDir(sshClient),
            () => this.purgeOldReleases(sshClient),
            () => this.uploadRelease(sshClient),
            () => this.unpackRelease(sshClient, configPresent),
            () => this.setPermission(sshClient),
            () => this.linkRelease(sshClient),

        ].reduce(Q.when, Q(null));

        successPromise.then(
            () => this.services.log.closeSection('Project transferred and published'),
            error => this.services.log.error(error)
        );

        return successPromise;
    }

    getBaseDir() {
        if (this.baseDir === null) {
            this.baseDir = this.services.config.getStageConfig().server.dir;
        }
        return this.baseDir;
    }

    getCurrentDir() {
        if (this.currentDir === null) {
            this.currentDir = this.getBaseDir() + '/releases/' + this.timestamp;
        }
        return this.currentDir;
    }

    private purgeOldReleases(sshClient:SshClient):Q.Promise<{}> {
        let baseDir     = this.getBaseDir(),
            filesToKeep = this.services.config.globalConfig.releases.keep;

        this.services.log.startSection('Purging outdated releases');

        let tasks = [
            () => sshClient.exec(`rm -rf ${baseDir}/releases/*.tar.gz`),
            () => {
                let deferred = Q.defer();
                sshClient.exec(`ls ${baseDir}/releases`).then((procResult:SshResult) => {
                    let dirNames = procResult.stdout
                                             .replace(/\n/g, ' ')
                                             .trim()
                                             .split(' ');

                    dirNames.sort();
                    for (let i = filesToKeep; i > 0; i--) {
                        dirNames.pop();
                    }

                    this.services.log.debug(`Purging ${dirNames.length} outdated release${dirNames.length === 1 ? '' : 's'}`);

                    let tasks:any[] = [];
                    dirNames.forEach((dirName) => {
                        tasks.push(() => sshClient.exec(`rm -rf ${baseDir}/releases/${dirName}`));
                    });
                    tasks.reduce(Q.when, Q(null)).then(
                        () => deferred.resolve(true),
                        error => deferred.reject(error)
                    )
                }).fail(error => deferred.reject(error));
                return deferred.promise;
            }
        ];

        let successPromise = tasks.reduce(Q.when, Q(null));

        successPromise.then(() => this.services.log.closeSection('Outdated releases successfully purged.'));

        return <Q.Promise<any>> successPromise;
    }

    private makeReleasesDir(sshClient:SshClient):Q.IPromise<boolean> {
        let dir               = this.getBaseDir(),
            releasesDir       = dir + '/releases',
            currentReleaseDir = this.getCurrentDir();

        this.services.log.startSection('Making sure releases directory exists');

        let successPromise = [
            () => sshClient.exec(`if [ ! -d "${releasesDir}" ]; then mkdir -p ${releasesDir}; fi`),
            () => sshClient.exec(`if [ -d "${currentReleaseDir}" ]; then rm -rf ${currentReleaseDir}; fi`),
            () => sshClient.exec('mkdir ' + currentReleaseDir)
        ].reduce(Q.when, Q(null));

        successPromise.then(() => {
            this.services.log.closeSection('releases directory exists');
        });

        return successPromise;
    }

    private uploadRelease(sshClient:SshClient) {
        return sshClient.upload(
            this.services.config.pathConfig.getTemp() + this.services.config.projectName + '.tar.gz',
            this.getCurrentDir() + '.tar.gz'
        );
    }

    private unpackRelease(sshClient:SshClient, configPresent:boolean):Q.Promise<any> {
        let baseDir   = this.getBaseDir(),
            dir       = this.getCurrentDir(),
            timestamp = this.timestamp;

        this.services.log.startSection('Unpacking release');

        let tasks = [
            () => sshClient.exec(`tar -zxf ${dir}.tar.gz -C ${dir}`),
            () => sshClient.exec(`if [ -d "${baseDir}" ]; then rm -rf ${baseDir}/config; fi`),
            () => sshClient.exec(`unlink ${dir}.tar.gz`)
        ];
        if (configPresent) {
            tasks.push(() => sshClient.exec(`mv ${dir}/_config-${timestamp} ${baseDir}/config`));
            tasks.push(() => sshClient.exec(`ln -s ../../config ${dir}/config`));
        }
        let successPromise = tasks.reduce(Q.when, Q(null));

        successPromise.then(() => this.services.log.closeSection('Release unpacked'));

        return <Q.Promise<any>> successPromise;
    }

    private setPermission(sshClient:SshClient):Q.IPromise<any> {
        return sshClient.exec('chmod 0755 ' + this.getCurrentDir());
    }

    private linkRelease(sshClient:SshClient):Q.IPromise<any> {

        let baseDir = this.getBaseDir();

        return [
            () => sshClient.exec(`if [ -h "${baseDir}/current" ]; then unlink ${baseDir}/current; fi`),
            () => sshClient.exec(`ln -s releases/${this.timestamp} ${baseDir}/current`)
        ].reduce(Q.when, Q(null));
    }
}