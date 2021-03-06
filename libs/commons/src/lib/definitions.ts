import * as mqtt from "mqtt";

export interface MQTTMessage {
    topic: string;
    payload: Buffer;

    timestamp: number;
}

export interface ScheduledMessage extends MQTTMessage {
    id: number;
}

export interface HTTPOptions {
    port: number;
}

export interface MQTTServerOptions {
    // Connexion options
    url: string;
    options?: mqtt.IClientOptions;

    // Subscribe options
    topics: string[];
}

export interface MQTTPublishOptions {
    /** Timeout after which message will be published. */
    timeout?: number;
    /** 
     * Date at which message must be published. 
     * 
     * Timestamp has the priority over timeout.
     * If timestamp is before the current timestamp on the server, it is sent with no delay.
     * */
    timestamp?: number;
}

export interface CronScenario {
    activated: boolean;
    name: string;
    tasks: CronTask[];
}

export interface CronTask {
    days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

    hours: number;
    minutes: number;

    topic: string;
    payload: string;
}

export interface ConfigFile {
    mqtt: MQTTServerOptions;
    dashboard: string;
    cron: CronScenario[];

    scheduledMessages: MQTTMessage[];
}

export type Service = (params: any) => Promise<any>;
