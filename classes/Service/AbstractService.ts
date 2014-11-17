import ServiceContainer = require('./ServiceContainer');

class AbstractService {

    services: ServiceContainer;

    constructor( serviceContainer: ServiceContainer ) {
        this.services = serviceContainer;
    }
}

export = AbstractService;