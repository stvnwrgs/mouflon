import Paths = require('./Config/Paths');
import Utils = require('./Utils');
import Mouflon = require('./Mouflon');

var dateFormat: any = require('dateformat');

class MouflonFactory {

    private static instantiationViaFactory = false;

    paths: Paths;
    projectName: string;
    stageName: string;

    static createFromArgV() {
        var factory: MouflonFactory;
        if (process.argv.length < 3) {
            Utils.exitWithError('Expecting at least two command line arguments');
        }
        MouflonFactory.instantiationViaFactory = true;
        factory = new MouflonFactory(process.argv[2], process.argv[3]);
        MouflonFactory.instantiationViaFactory = false;

        return factory;
    }

    constructor( projectName: string, stageName: string ) {

        if (!MouflonFactory.instantiationViaFactory) {
            Utils.exitWithError('MouflonFactory cannot be instantiated directly. Use createFromArgV()');
        }

        this.projectName = projectName;
        this.stageName = stageName;

        this.paths = new Paths(
            './temp',
            './settings',
            './config',
            './cache'
        );
    }

    setPaths( paths: {[key:string]:string} ): void {
        this.paths.updatePaths(paths);
    }

    createMouflon(): Mouflon {
        var timestamp = dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss');
        return new Mouflon(this.projectName, this.stageName, this.paths, timestamp);
    }
}

export = MouflonFactory;