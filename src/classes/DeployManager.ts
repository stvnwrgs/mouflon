/// <reference path="../../typings/tsd.d.ts" />

import Git = require('git');
import fs = require('fs');
import rimraf = require('rimraf');
import Q = require('q');
import jsyaml = require('js-yaml');
var merge:any = require('merge-recursive');
var sprintf:sPrintF.sprintf = require('sprintf-js').sprintf;

import GlobalConfig from './Config/GlobalConfig';
import Paths from './Config/Paths';

import ServiceContainer from './Service/ServiceContainer';

import LocalBashTask from './Task/Local/LocalBashTask';
import BowerTask from './Task/Local/BowerTask';
import ComposerTask from './Task/Local/ComposerTask';
import GruntTask from './Task/Local/GruntTask';
import GulpTask from './Task/Local/GulpTask';
import TsdTask from './Task/Local/TsdTask';
import NodeTask from './Task/Local/NodeTask';
import MavenTask from './Task/Local/MavenTask';
import TaskDefinition from './Task/TaskDefinition';

import RemoteBashTask from './Task/Remote/RemoteBashTask';
import LinkedDirTask from './Task/Remote/LinkedDirTask';
import LinkedFileTask from './Task/Remote/LinkedFileTask';
import SshClient from "./Service/SshClient";


export default class DeployManager {

    private services:ServiceContainer;

    constructor(serviceContainer:ServiceContainer) {
        this.services = serviceContainer;
    }

    deploy():Q.IPromise<boolean> {

        var config        = this.services.config,
            configPresent = fs.existsSync(config.paths.getConfig() + config.projectName + '/' + config.stageName);

        var tasks = [
            () => this.loadGlobalSettings(),
            () => this.loadProjectSettings(),
            () => this.cache(),
            () => this.checkout(),
            () => this.build(),
            () => this.prepareTransfer(configPresent),
            () => {
                var stageSpecificTasks = [];
                this.services.config.getHostsForStage().forEach(host => {

                    var client = this.services.sshClientFactory.getClient(host);
                    stageSpecificTasks.push(() => this.services.transfer.transfer(client, configPresent));
                    stageSpecificTasks.push(() => this.finalize(client));
                });
                return stageSpecificTasks.reduce(Q.when, Q(null));
            },
            () => this.cleanUp()
        ];

        return tasks.reduce(Q.when, Q(null));
    }

    private build():Q.Promise<boolean> {

        var tasks:Q.Promise<any>[] = [],
            taskPromise:Q.Promise<boolean>;

        this.services.log.startSection('Executing local build tasks');
        if (!this.services.config.projectConfig.localTasks) {
            this.services.log.closeSection('No local tasks found ("localTasks")');

        } else {
            this.services.config.projectConfig.localTasks.forEach((task:TaskDefinition) => {
                var Class;
                switch (task.task) {
                    case 'composer':
                        Class = ComposerTask;
                        break;
                    case 'node':
                        Class = NodeTask;
                        break;
                    case 'bower':
                        Class = BowerTask;
                        break;
                    case 'grunt':
                        Class = GruntTask;
                        break;
                    case 'gulp':
                        Class = GulpTask;
                        break;
                    case 'tsd':
                        Class = TsdTask;
                        break;
                    case 'bash':
                        Class = LocalBashTask;
                        break;
                    case 'maven':
                        Class = MavenTask;
                        break;
                    default:
                        this.services.log.warn('Ignoring unknown task type "' + task.task + '".');
                        return;
                }

                var instance = new Class(this.services, task.prefs ? task.prefs : {});
                if (task.mod) {
                    instance.modify(task.mod);
                }
                tasks.push(instance.execute.bind(instance));
            });
        }
        taskPromise = tasks.reduce(Q.when, Q(null));
        taskPromise.then(() => {
            this.services.log.closeSection('Local build tasks executed');
        });
        return taskPromise;

    }

    private finalize(sshClient:SshClient):Q.Promise<boolean> {
        var tasks       = [],
            remoteTasks = this.services.config.projectConfig.remoteTasks,
            successPromise;

        this.services.log.startSection('Executing remote tasks to finalize project');

        if (remoteTasks && remoteTasks.length > 0) {
            remoteTasks.forEach((task:TaskDefinition) => {
                var Class;
                switch (task.task) {
                    case 'bash':
                        Class = RemoteBashTask;
                        break;
                    case 'linkedDirs':
                        Class = LinkedDirTask;
                        break;
                    case 'linkedFiles':
                        Class = LinkedFileTask;
                        break;
                    default:
                        this.services.log.warn('Ignoring unknown task type "' + task.task + '".');
                        return;
                }

                var instance = new Class(this.services, task.prefs ? task.prefs : {});

                instance.setSshClient(sshClient);

                tasks.push(instance.execute.bind(instance));
            });
        }

        successPromise = tasks.reduce(Q.when, Q(null));

        successPromise.then(()=> {
            if (remoteTasks && remoteTasks.length > 0) {
                this.services.log.closeSection(sprintf('Successfully executed %d remote tasks.', remoteTasks.length));
            } else {
                this.services.log.closeSection('There were no remote tasks to execute');
            }
        });
        return successPromise;
    }

    private prepareTransfer(configPresent:boolean) {
        var config = this.services.config;
        var configDir = config.paths.getTemp() + config.projectName + (config.projectConfig.distDirectory !== '' ? '/' + config.projectConfig.distDirectory : '') + '/_config-' + this.services.config.timestamp;
        var tasks = [];
        var successPromise;

        this.services.log.startSection('Preparing transfer');

        if (configPresent) {
            tasks = [
                ()=> {
                    this.services.log.startSection('Adding config files to package');
                    return this.services.shell.exec('mkdir ' + configDir, true);
                },
                ()=> {
                    return this.services.shell.exec('cp -r ' + config.paths.getConfig() + config.projectName + '/' + config.stageName + '/* ' + configDir, true).then(()=> {
                        this.services.log.closeSection('Config files added to package');
                    });
                }
            ];
        }

        tasks.push(() => {
            this.services.log.startSection('Packing files');
            var changeDirArg = '';
            if (config.projectConfig.distDirectory !== '') {
                changeDirArg = '-C ' + config.projectConfig.distDirectory + ' ';
            }
            return this.services.shell.exec('tar ' + changeDirArg + '-zcf ../' + config.projectName + '.tar.gz .').then(() => {
                this.services.log.closeSection('Files packed');
            });
        });
        successPromise = tasks.reduce(Q.when, Q(null));
        successPromise.then(() => {
            this.services.log.closeSection('Transfer prepared')
        });
        return successPromise;
    }


    private loadGlobalSettings():Q.Promise<boolean> {
        var config      = this.services.config,
            settingsDir = config.paths.getSettings(),
            d           = Q.defer<boolean>();

        this.services.log.startSection('Loading global settings');

        fs.readFile(settingsDir + 'settings.yml', (err, settingsBuffer:Buffer) => {
            if (err) {
                d.reject(err);
                return;
            }

            fs.readFile(settingsDir + 'local_override.yml', (err, overrideBuffer:Buffer) => {
                var overrideSettings;
                if (err) {
                    this.services.log.warn('Could not load optional ' + settingsDir + 'local_override.yml');
                    overrideSettings = {};
                } else {
                    overrideSettings = jsyaml.load('' + overrideBuffer);
                    if (!overrideSettings) {
                        overrideSettings = {};
                    }
                }

                config.globalConfig = <GlobalConfig> merge(
                    jsyaml.load('' + settingsBuffer),
                    overrideSettings
                );

                if (err) {
                    this.services.log.closeSection('Global settings loaded');
                } else {
                    this.services.log.closeSection('Global settings (and local overrides) loaded');
                }
                d.resolve(true);
            });
        });
        return d.promise;
    }

    private loadProjectSettings():Q.Promise<boolean> {
        var config      = this.services.config,
            settingsDir = config.paths.getSettings(),
            d           = Q.defer<boolean>();

        this.services.log.startSection('Loading project specific settings from ' + settingsDir + 'projects/' + config.projectName + '/settings.yml');

        fs.readFile(settingsDir + 'projects/' + config.projectName + '/settings.yml', (err, data:Buffer) => {
            if (err) {
                d.reject(err);
                return;
            }
            config.projectConfig = jsyaml.load('' + data);
            this.services.log.closeSection('Project specific settings loaded');

            if (config.projectConfig.stages[config.stageName] === undefined) {
                d.reject('No stage named "' + config.stageName + '" found in ' + settingsDir + '/projects/' + config.projectName + '/settings.yml');
            } else {
                d.resolve(true);
            }

            // check distDirectory setting
            if (typeof config.projectConfig.distDirectory === 'undefined') {
                config.projectConfig.distDirectory = ''; // default
            }
            var distDirectoryTmp = config.projectConfig.distDirectory.trim();
            // ensure leading slash is removed
            if (distDirectoryTmp.substr(0, 1) === '/') {
                distDirectoryTmp = distDirectoryTmp.substr(1);
            }
            // ensure trailing slash is removed
            if (distDirectoryTmp.substr(distDirectoryTmp.length - 1) === '/') {
                distDirectoryTmp = distDirectoryTmp.substr(0, distDirectoryTmp.length - 1);
            }
            config.projectConfig.distDirectory = distDirectoryTmp;
        });
        return d.promise;
    }

    private cache():Q.Promise<boolean> {
        var config      = this.services.config,
            stageConfig = config.getStageConfig(),
            cacheDir    = config.paths.getCache(),
            promise;

        this.services.log.startSection('Updating local cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        if (fs.existsSync(cacheDir + config.projectName)) {
            promise = this.services.shell.exec('cd ' + cacheDir + config.projectName + '; git fetch && git checkout ' + stageConfig.branch + ' && git pull', true)
        } else {
            promise = this.services.shell.exec(sprintf('git clone %s -b %s %s %s',
                config.projectConfig.repo.submodules ? '--recursive' : '',
                stageConfig.branch,
                config.projectConfig.repo.url,
                cacheDir + config.projectName
            ));
        }
        promise.then(()=> {
            this.services.log.closeSection('Local cache updated');
        });
        return promise;
    }

    private checkout():Q.Promise<boolean> {

        var config      = this.services.config,
            stageConfig = config.getStageConfig(),
            deferred    = Q.defer<boolean>(),
            tempDir     = config.paths.getTemp(),
            git         = new Git.Git(tempDir + config.projectName),
            cacheParam  = ' --reference ' + config.paths.getCache() + config.projectName;

        this.services.log.startSection(sprintf('Checking out branch "%s" from "%s"...', stageConfig.branch, config.projectConfig.repo.url));

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        if (fs.existsSync(tempDir + config.projectName)) {
            rimraf.sync(tempDir + config.projectName);
        }
        if (fs.existsSync(tempDir + config.projectName + '.tar.gz')) {
            fs.unlinkSync(tempDir + config.projectName + '.tar.gz');
        }
        fs.mkdirSync(tempDir + config.projectName);

        //var command = 'clone -b ' + stageConfig.branch + cacheParam + ' ' + config.projectConfig.repo.url + ' ' + tempDir + config.projectName;

        var command = sprintf('clone %s -b %s %s %s %s',
            config.projectConfig.repo.submodules ? '--recursive' : '',
            stageConfig.branch,
            cacheParam,
            config.projectConfig.repo.url,
            tempDir + config.projectName
        );
        this.services.log.debug(command);
        git.git(command, (err, result) => {
            if (err) {
                deferred.reject(err);
                return;
            }
            this.services.log.closeSection('Branch successfully checked out');
            deferred.resolve(true);
        });
        return deferred.promise;
    }

    private cleanUp() {
        this.services.log.startSection('Purging temporary files');
        return this.services.shell.exec('cd ' + this.services.config.paths.getTemp() + '; rm -rf ..?* .[!.]* *', true).then(() => {
            this.services.log.closeSection('Temporary files purged.');
        });
    }
}