/// <reference path="../../../definitions/Q/Q.d.ts" />

import AbstractTask = require('./../AbstractTask');
import Task = require('./../Task');
import Q = require('q');

class NodeTask extends AbstractTask implements Task {

    execute() {

        var d = Q.defer(),
            task = this.getPrefs()['task'] ? ' ' + this.getPrefs()['task'] : '';

        this.services.log.logStart('Executing grunt task' + task);
        this.services.shell.exec('grunt' + task).then(()=> {
            this.services.log.logEnd('Grunt task' + task + ' executed');
            d.resolve(true);
        });
        return d.promise;

    }
}

export = NodeTask;