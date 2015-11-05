interface StageConfig {
    branch: string;
    server: {
        host?: string;
        hosts?: string[];
        user: string;
        dir:string;
        port:number;
    }
}

export = StageConfig;