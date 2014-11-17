class Paths {
    private temp: string;
    private settings: string;
    private config: string;
    private cache: string;

    constructor( temp: string, settings: string, config: string, cache: string ) {
        this.temp = temp;
        this.settings = settings;
        this.config = config;
        this.cache = cache;
    }

    updatePaths( newPaths: {[key:string]:string} ): void {
        var pathKeys = ['config', 'settings', 'temp', 'cache'];

        pathKeys.forEach(( pathKey: string )=> {
            var path = newPaths[pathKey];

            if (newPaths[pathKey]) {
                while (path.substr(0, path.length - 1) === '/') {
                    path = path.substr(0, path.length - 1)
                }
                this[pathKey] = path;
            }
        });
    }

    getTemp(): string {
        return this.temp + '/';
    }

    getSettings(): string {
        return this.settings + '/';
    }

    getConfig(): string {
        return this.config + '/';
    }

    getCache(): string {
        return this.cache + '/';
    }
}

export = Paths;