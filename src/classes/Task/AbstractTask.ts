import ServiceContainer from './../Service/ServiceContainer';

export default class AbstractTask {

    constructor(public services:ServiceContainer, private prefs:{[key:string]:any}) {
    }

    getPrefs():{[key:string]:any} {
        return this.prefs;
    }

    modify(modBody:string) {

        var wrapper = new Function('$stageName', modBody);
        wrapper.apply(this, [this.services.config.stageName]);
    }
}