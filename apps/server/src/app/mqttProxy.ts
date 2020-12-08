import * as mqtt from 'mqtt';
import { Router } from 'express';
import { MQTTMessage, MQTTServerOptions, MQTT_API } from '@mqtttoolbox/commons';
import { buildRoutes } from './tools/express';

export class MQTTProxy {
    private static _client: mqtt.Client = null;
    private static _messages: { [topic: string]: MQTTMessage } = {};

    public static async connect(server: MQTTServerOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            MQTTProxy._client = mqtt.connect(server.url, server.options);

            MQTTProxy._client.on("connect", () => {
                MQTTProxy._client.subscribe(server.topics);
                resolve();
            });

            // If promise was resolved, won't have any effect, so no problem for future errors
            MQTTProxy._client.on("error", (err) => {
                reject(err);
            });

            MQTTProxy._client.on("message", (topic: string, payload: Buffer) => {
                const message = {
                    topic,
                    payload,

                    timestamp: new Date().getTime(),
                    source: "server"
                };

                MQTTProxy._messages[topic] = message;
            });
        });
    }

    public static get(topic: string): MQTTMessage {
        return MQTTProxy._messages[topic];
    }

    public static getAll(filter?: {
        topic?: RegExp;
        after?: number;
    }): MQTTMessage[] {
        let res: MQTTMessage[] = [];
        for (let topic in MQTTProxy._messages) {
            const msg = MQTTProxy._messages[topic];

            if (filter && filter.topic && !topic.match(filter.topic)) {
                continue;
            }
            if (filter && filter.after && filter.after > msg.timestamp) {
                continue;
            }

            res.push(MQTTProxy._messages[topic]);
        }
        return res;
    }

    public static async publish(topic: string, payload: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            if (MQTTProxy._client) {
                MQTTProxy._client.publish(topic, payload, {}, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            }
        });
    }
}

export function buildMQTTRouter(): Router {
    let api: MQTT_API = {
        getUpdate: (args: { after: number }) => {
            return Promise.resolve(MQTTProxy.getAll(args));
        },
        publish: async (args: { topic: string, payload: any }) => {
            return MQTTProxy.publish(args.topic, args.payload);
        }
    };
    return buildRoutes(<any>api);
}
