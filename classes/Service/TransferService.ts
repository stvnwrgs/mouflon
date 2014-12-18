/// <reference path="../../definitions/Q/Q.d.ts" />

import Q = require('q');

import ServiceContainer=require('./ServiceContainer');
import AbstractService=require('./AbstractService');
import SshResult = require('./SshResult');

var sprintf: sPrintF.sprintf = require('sprintf-js').sprintf;

class TransferService extends AbstractService {

    private timestamp: string;
    private baseDir: string = null;
    private currentDir: string = null;

    constructor(timestamp: string, serviceContainer: ServiceContainer) {
        super(serviceContainer);
        this.timestamp = timestamp;
    }

    transfer(configPresent: boolean): Q.IPromise<any> {

        var serializedPromise: Q.IPromise<any> = [
            () => {
                this.services.log.startSection('Transferring project to remote');
            },
            () => { return this.purgeOldReleases(); },
            () => { return this.makeReleasesDir(); },
            () => { return this.uploadRelease(); },
            () => { return this.unpackRelease(configPresent); },
            () => { return this.linkRelease(); },
            () => {
                this.services.log.closeSection('Project transferred and published');
            }
        ].reduce(Q.when, Q(null));

        serializedPromise.then(
            () => {},
            (error) => {
                this.services.log.error(error);
            }
        );

        return serializedPromise;
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

    private purgeOldReleases() {
        var client = this.services.ssh,
            baseDir = this.getBaseDir(),
            filesToKeep = this.services.config.globalConfig.releases.keep;

        this.services.log.startSection('Purging outdated releases');

        [
            () => { return client.exec(sprintf('rm -rf %s/releases/*.tar.gz', baseDir)); },
            () => { return client.exec(sprintf('if [ ! -d "%1$s/releases" ]; then mkdir %1$s/releases; fi', baseDir)) },
            () => {
                var deferred = Q.defer();
                client.exec(sprintf('ls %s/releases', baseDir)).then((procResult: any) => {
                    var i: any,
                        tasks: any[] = [],
                        dirNames = procResult.stdout.replace(/\n/g, ' ').trim().split(' ');

                    dirNames.sort();
                    for (i = filesToKeep; i > 0; i--) {
                        dirNames.pop();
                    }

                    this.services.log.debug(sprintf('Purging %s outdated release%s', dirNames.length, dirNames.length === 1 ? '' : 's'));
                    dirNames.forEach((dirName) => {
                        tasks.push(() => { return client.exec(sprintf('rm -rf %s/releases/%s', baseDir, dirName)); });
                    });
                    tasks.reduce(Q.when, Q(null)).then(() => {
                        this.services.log.closeSection('Outdated releases successfully purged.');
                        deferred.resolve(true);
                    })
                }).fail((error)=> {
                    deferred.reject(error);
                });
            }
        ].reduce(Q.when, Q(null));
    }

    private makeReleasesDir(): Q.IPromise<boolean> {
        var dir = this.getBaseDir(),
            releasesDir = dir + '/releases',
            currentReleaseDir = this.getCurrentDir(),
            client = this.services.ssh;

        return [
            () => { return client.exec(sprintf('if [ ! -d "%1$s" ]; then mkdir %1$s; fi', releasesDir));},
            () => { return client.exec(sprintf('if [ -d "%1$s" ]; then rm -rf %1$s; fi', currentReleaseDir)); },
            () => { return client.exec(sprintf('mkdir %s', currentReleaseDir)); }
        ].reduce(Q.when, Q(null));
    }

    private uploadRelease() {
        return this.services.ssh.upload(
            sprintf('%s%s.tar.gz', this.services.config.paths.getTemp(), this.services.config.projectName),
            sprintf('%s.tar.gz', this.getCurrentDir())
        );
    }

    private unpackRelease(configPresent: boolean): Q.Promise<boolean> {
        var client = this.services.ssh,
            baseDir = this.getBaseDir(),
            dir = this.getCurrentDir(),
            timestamp = this.timestamp,
            tasks;

        tasks = [
            () => { return client.exec(sprintf('tar -zxf %1$s.tar.gz -C %1$s', dir)); },
            () => { return client.exec(sprintf('if [ -d "%1$s/config" ]; then rm -rf %1$s/config; fi', baseDir)); },
            () => { return client.exec(sprintf('unlink %s.tar.gz', dir)); }
        ];
        if (configPresent) {
            tasks.push(() => {
                return client.exec(sprintf('mv %s/_config-%s %s/config', dir, timestamp, baseDir));
            });
            tasks.push(() => {
                return client.exec(sprintf('ln -s ../../config %s/config', dir));
            });
        }
        return tasks.reduce(Q.when, Q(null));
    }

    private linkRelease(): Q.IPromise<any> {

        return [
            () => { return this.services.ssh.exec(sprintf('if [ -h "%1$s/current" ]; then unlink %1$s/current; fi', this.getBaseDir())); },
            () => { return this.services.ssh.exec(sprintf('ln -s releases/%s %s/current', this.timestamp, this.getBaseDir())); }
        ].reduce(Q.when, Q(null));
    }
}

export = TransferService;