
interface GlobalConfig {
    composer: {
        command: string;
    };
    releases: {
        keep: number;
    };
    custom: any;
}

export default GlobalConfig;