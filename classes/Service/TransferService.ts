/// <reference path="../../definitions/Q/Q.d.ts" />

import Q = require('q');

import ServiceContainer=require('./ServiceContainer');
import AbstractService=require('./AbstractService');
import SshResult = require('./SshResult');
import SshClient = require("./SshClient");

var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class TransferService extends AbstractService {

    private baseDir: string = null;
    private currentDir: string = null;

    constructor(private timestamp: string,
                serviceContainer: ServiceContainer) {
        super(serviceContainer);
    }

    transfer(sshClient: SshClient, configPresent: boolean): Q.IPromise<any> {

        var successPromise;

        this.services.log.startSection('Transferring project to remote');

        successPromise = [
            () => { return this.makeReleasesDir(); },
            () => { return this.purgeOldReleases(sshClient); },
            () => { return this.uploadRelease(sshClient); },
            () => { return this.unpackRelease(sshClient, configPresent); },
            () => { return this.setPermission(sshClient); },
            () => { return this.linkRelease(sshClient); },

        ].reduce(Q.when, Q(null));

        successPromise.then(
            () => {
                this.services.log.closeSection('Project transferred and published');
            },
            (error) => {
                this.services.log.error(error);
            }
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

    private purgeOldReleases(sshClient: SshClient): Q.Promise<{}> {
        var baseDir = this.getBaseDir(),
            filesToKeep = this.services.config.globalConfig.releases.keep,
            tasks,
            successPromise;

        this.services.log.startSection('Purging outdated releases');

        tasks = [
            () => { return sshClient.exec(sprintf('rm -rf %s/releases/*.tar.gz', baseDir)); },
            () => {
                var deferred = Q.defer();
                sshClient.exec(sprintf('ls %s/releases', baseDir)).then((procResult: SshResult) => {
                    var i: any,
                        tasks: any[] = [],
                        dirNames = procResult.stdout.replace(/\n/g, ' ').trim().split(' ');
                    dirNames.sort();
                    for (i = filesToKeep; i > 0; i--) {
                        dirNames.pop();
                    }

                    this.services.log.debug(sprintf('Purging %d outdated release%s', dirNames.length, dirNames.length === 1 ? '' : 's'));

                    dirNames.forEach((dirName) => {
                        tasks.push(() => { return sshClient.exec(sprintf('rm -rf %s/releases/%s', baseDir, dirName)); });
                    });
                    tasks.reduce(Q.when, Q(null)).then(
                        () => {
                            deferred.resolve(true);
                        }, (error) => {
                            deferred.reject(error);
                        })
                }).fail((error)=> {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        ];

        successPromise = tasks.reduce(Q.when, Q(null));

        successPromise.then(() => {
            this.services.log.closeSection('Outdated releases successfully purged.');
        });

        return successPromise;
    }

    private makeReleasesDir(): Q.IPromise<boolean> {
        var dir = this.getBaseDir(),
            releasesDir = dir + '/releases',
            currentReleaseDir = this.getCurrentDir(),
            client = this.sshClient,
            successPromise;

        this.services.log.startSection('Making sure releases directory exists');

        successPromise = [
            () => { return client.exec(sprintf('if [ ! -d "%1$s" ]; then mkdir %1$s; fi', releasesDir)); },
            () => { return client.exec(sprintf('if [ -d "%1$s" ]; then rm -rf %1$s; fi', currentReleaseDir)); },
            () => { return client.exec(sprintf('mkdir %s', currentReleaseDir)); }
        ].reduce(Q.when, Q(null));

        successPromise.then(() => {
            this.services.log.closeSection('releases directory exists');
        });

        return successPromise;
    }

    private uploadRelease(sshClient: SshClient) {
        return sshClient.upload(
            sprintf('%s%s.tar.gz', this.services.config.paths.getTemp(), this.services.config.projectName),
            sprintf('%s.tar.gz', this.getCurrentDir())
        );
    }

    private unpackRelease(sshClient: SshClient, configPresent: boolean): Q.Promise<boolean> {
        var baseDir = this.getBaseDir(),
            dir = this.getCurrentDir(),
            timestamp = this.timestamp,
            tasks,
            successPromise;

        this.services.log.startSection('Unpacking release');

        tasks = [
            () => { return sshClient.exec(sprintf('tar -zxf %1$s.tar.gz -C %1$s', dir)); },
            () => { return sshClient.exec(sprintf('if [ -d "%1$s/config" ]; then rm -rf %1$s/config; fi', baseDir)); },
            () => { return sshClient.exec(sprintf('unlink %s.tar.gz', dir)); }
        ];
        if (configPresent) {
            tasks.push(() => {
                return sshClient.exec(sprintf('mv %s/_config-%s %s/config', dir, timestamp, baseDir));
            });
            tasks.push(() => {
                return sshClient.exec(sprintf('ln -s ../../config %s/config', dir));
            });
        }
        successPromise = tasks.reduce(Q.when, Q(null));

        successPromise.then(()=> {
            this.services.log.closeSection('Release unpacked');
        });

        return successPromise;
    }

    private setPermission(sshClient: SshClient) : Q.IPromise<any> {
        return sshClient.exec(sprintf('chmod 0755 %s', this.getCurrentDir()));
    }

    private linkRelease(sshClient: SshClient): Q.IPromise<any> {

        return [
            () => { return sshClient.exec(sprintf('if [ -h "%1$s/current" ]; then unlink %1$s/current; fi', this.getBaseDir())); },
            () => { return sshClient.exec(sprintf('ln -s releases/%s %s/current', this.timestamp, this.getBaseDir())); }
        ].reduce(Q.when, Q(null));
    }
}

export = TransferService;