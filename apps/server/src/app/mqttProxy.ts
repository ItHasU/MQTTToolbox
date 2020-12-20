import * as mqtt from 'mqtt';
import { Router, raw, json } from 'express';
import { MQTTMessage, MQTTServerOptions } from '@mqtttoolbox/commons';

export class MQTTProxy {
    private static _client: mqtt.Client = null;
    private static readonly _messages: { [topic: string]: MQTTMessage } = {};

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

                    timestamp: new Date().getTime()
                };

                MQTTProxy._messages[topic] = message;
            });
        });
    }

    public static list(): string[] {
        return Object.keys(MQTTProxy._messages);
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
                MQTTProxy._client.publish(topic, payload, (err) => {
                    if (err) reject(err);
                    else {
                        MQTTProxy._messages[topic] = {
                            topic,
                            payload,
                            timestamp: new Date().getTime()
                        };
                        resolve();
                    }
                });
            } else {
                reject(`Not connected`);
            }
        });
    }
}

export function buildMQTTRouter(): Router {
    let router: Router = Router();

    router.get("/list", (req, res) => {
        res.json(MQTTProxy.list());
    });

    router.get("/all", json({ type: "*/*" }), (req, res) => {
        let after: number;
        try {
            after = Number.parseInt(req.header('after'));
        } catch (e) {
            // Don't care
            after = undefined;
        }

        res.json(MQTTProxy.getAll({ after }));
    });

    router.post("/get", json({ type: "*/*" }), (req, res) => {
        let topic = req.body?.topic;
        if (!topic) {
            res.sendStatus(400);
            return;
        }

        let message = MQTTProxy.get(topic);
        if (!message) {
            res.sendStatus(404);
            return;
        }

        res.json(message);
    });

    // curl -s -o - -X POST -H "Topic: test" http://localhost:3333/mqtt --d @data.txt
    router.post("/publish", raw({ type: "*/*" }), async (req, res) => {
        try {
            await MQTTProxy.publish(req.header("Topic"), req.body);
            res.send("OK");
        } catch (e) {
            res.status(500).send(e);
        }
    });

    return router;
}
