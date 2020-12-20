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
    topics: string | string[];
}

export interface Config {
    http: HTTPOptions;
    mqtt: MQTTServerOptions;
}

export type Service = (params: any) => Promise<any>;