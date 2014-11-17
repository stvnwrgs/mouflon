import ServiceContainer = require('./../Service/ServiceContainer');

class AbstractTask {

    services: ServiceContainer;
    private prefs: {[key:string]:any};

    constructor( serviceContainer: ServiceContainer, prefs: {[key:string]:any} ) {
        this.services = serviceContainer;
        this.prefs = prefs;
    }

    getPrefs(): {[key:string]:any} {
        return this.prefs;
    }

    modify( modBody: string ) {

        var wrapper = new Function('$stageName', modBody);
        wrapper.apply(this, [this.services.config.stageName]);
    }
}

export = AbstractTask;