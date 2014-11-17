/// <reference path="../../definitions/Q/Q.d.ts" />

import Q = require('q');

import ServiceContainer=require('./ServiceContainer');
import AbstractService=require('./AbstractService');
import SshResult = require('./SshResult');

class TransferService extends AbstractService {

    private timestamp: string;
    private baseDir: string = null;
    private currentDir: string = null;

    constructor( timestamp: string, serviceContainer: ServiceContainer ) {
        super(serviceContainer);
        this.timestamp = timestamp;
    }

    transfer( configPresent: boolean ): Q.IPromise<any> {

        var serializedPromise: Q.IPromise<any> = [
            ()=> {return this.purgeOldReleases();},
            ()=> {return this.makeReleasesDir();},
            ()=> {return this.uploadRelease();},
            ()=> {return this.unpackRelease(configPresent); },
            ()=> {return this.linkRelease();}
        ].reduce(Q.when, Q(null));

        serializedPromise.then(
            ()=> {},
            ( error ) => {
                console.log(error);
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

        [
            ()=> { return client.exec('rm -rf ' + baseDir + '/releases/*.tar.gz'); },
            ()=> { return client.exec('if [ ! -d "' + baseDir + '/releases" ]; then mkdir ' + baseDir + '/releases; fi')},
            () => {
                var deferred = Q.defer();
                client.exec('ls ' + baseDir + '/releases').then(function ( procResult: any ) {
                    var i: any,
                        tasks: any[] = [],
                        dirNames = procResult.stdout.replace(/\n/g, ' ').trim().split(' ');

                    dirNames.sort();
                    for (i = filesToKeep; i > 0; i--) {
                        dirNames.pop();
                    }

                    console.log('Purging ' + dirNames.length + ' outdated release' + (dirNames.length === 1 ? '' : 's'));
                    dirNames.forEach(function ( dirName ) {
                        tasks.push(function () {
                            return client.exec('rm -rf ' + baseDir + '/releases/' + dirName);
                        });
                    });
                    tasks.reduce(Q.when, Q(null)).then(function () {
                        deferred.resolve(true);
                    })
                }).fail(( error )=> {
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

        return [()=> {
            return client.exec('if [ ! -d "' + releasesDir + '" ]; then mkdir ' + releasesDir + '; fi');
        }, () => {
            return client.exec('if [ -d "' + currentReleaseDir + '" ]; then rm -rf ' + currentReleaseDir + '; fi');
        }, ()=> {
            return client.exec('mkdir ' + currentReleaseDir);
        }].reduce(Q.when, Q(null));
    }

    private uploadRelease() {
        return this.services.ssh.upload(this.services.config.paths.getTemp() + this.services.config.projectName + '.tar.gz', this.getCurrentDir() + '.tar.gz');
    }

    private unpackRelease( configPresent: boolean ): Q.Promise<boolean> {
        var deferred = Q.defer<boolean>(),
            client = this.services.ssh,
            baseDir = this.getBaseDir(),
            dir = this.getCurrentDir(),
            timestamp = this.timestamp,
            tasks = [];

        tasks = [()=> {
            return client.exec('tar -zxf ' + dir + '.tar.gz -C ' + dir);
        }, ()=> {
            return client.exec('if [ -d "' + baseDir + '/config" ]; then rm -rf ' + baseDir + '/config; fi');
        }, ()=> {
            return client.exec('unlink ' + dir + '.tar.gz');
        }];
        if (configPresent) {
            tasks.push(()=> {
                return client.exec('mv ' + dir + '/_config-' + timestamp + ' ' + baseDir + '/config');
            });
            tasks.push(()=> {
                return client.exec('ln -s ../../config ' + dir + '/config');
            });
        }
        return tasks.reduce(Q.when, Q(null));
    }

    private linkRelease(): Q.IPromise<any> {

        return [()=> {
            return this.services.ssh.exec('if [ -h "' + this.getBaseDir() + '/current" ]; then unlink ' + this.getBaseDir() + '/current; fi');
        }, ()=> {
            return this.services.ssh.exec('ln -s releases/' + this.timestamp + ' ' + this.getBaseDir() + '/current');
        }].reduce(Q.when, Q(null));
    }
}

export = TransferService;