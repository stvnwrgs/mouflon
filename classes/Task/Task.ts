/// <reference path="../../definitions/Q/Q.d.ts" />

import Q = require('q');

interface Task {

    execute():Q.IPromise<{}>;
    modify( modBody: string ): void;
}

export = Task;