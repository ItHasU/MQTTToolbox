import * as mqtt from "mqtt";

export interface MQTTMessage {
    topic: string;
    payload: Buffer;

    timestamp: number;
    source: string;
}

export interface MQTTServerOptions {
    // Connexion options
    url: string;
    options?: mqtt.IClientOptions;

    // Subscribe options
    topics: string | string[];
}

export interface Config {
    server: MQTTServerOptions;
}

export type Service = (params: any) => Promise<any>;