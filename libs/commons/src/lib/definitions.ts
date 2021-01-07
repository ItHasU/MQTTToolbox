import * as mqtt from "mqtt";

export interface MQTTMessage {
    topic: string;
    payload: Buffer;

    timestamp: number;
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
    // Timeout after which message will be published
    timeout?: number;
}

export interface ConfigFile {
    mqtt: MQTTServerOptions;
    dashboard: string;
}

export type Service = (params: any) => Promise<any>;