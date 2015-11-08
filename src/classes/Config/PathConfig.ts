export default class PathConfig {

    constructor(private temp: string, private settings: string, private config: string, private cache: string) {
    }

    updatePaths(newPaths: {[key:string]:string}): void {
        let pathKeys = ['config', 'settings', 'temp', 'cache'];

        pathKeys.forEach(pathKey=> {
            let path = newPaths[pathKey];

            if (newPaths[pathKey]) {
                while (path.substr(0, path.length - 1) === '/') {
                    path = path.substr(0, path.length - 1)
                }
                this[pathKey] = path;
            }
        });
    }

    getReadable(): string {
        return `temp: "${this.temp}", settings: "${this.settings}", config: "${this.config}", cache: "${this.cache}"`;
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
