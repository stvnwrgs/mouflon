interface StageConfig {
    branch: string;
    server: {
        host: string;
        user: string;
        dir:string;
        port:number;
    }
}

export = StageConfig;