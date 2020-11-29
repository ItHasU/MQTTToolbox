import * as mqtt from "mqtt";

export interface MQTTServerOptions {
    // Connexion options
    url: string;
    options?: mqtt.IClientOptions;

    // Subscribe options
    topics: string[];
}

export interface Config {
    mqttServers: { [uid: string]: MQTTServerOptions };
}
