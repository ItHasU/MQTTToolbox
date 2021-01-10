import * as mqtt from 'mqtt';
import { Router, raw, json } from 'express';
import { MQTTMessage, MQTTServerOptions, MQTTPublishOptions } from '@mqtttoolbox/commons';

function tryParseJSON(text: string): any {
    try {
        return JSON.parse(text);
    } catch (e) {
        // We don't care
        return undefined;
    }
}

interface ScheduledMQTTMessage extends MQTTMessage {
    resolve?: () => void;
    reject?: (e: any) => void;
}

export class MQTTProxy {
    //-- MQTT Client --
    private static _client: mqtt.Client = null;
    //-- Messages received --
    private static readonly _messages: { [topic: string]: MQTTMessage } = {};
    //-- Scheduled messages --
    private static _pendingMessages: ScheduledMQTTMessage[] = [];
    private static _timeoutHandle: NodeJS.Timer = null;

    //#region Connection ------------------------------------------------------

    public static isConnected(): boolean {
        return MQTTProxy._client?.connected ? true : false;
    }

    public static async connect(server: MQTTServerOptions): Promise<void> {
        await MQTTProxy.disconnect();

        return new Promise<void>((resolve, reject) => {
            console.log(`Connecting to ${server.url}...`);
            const client = mqtt.connect(server.url, server.options);

            client.on("connect", () => {
                console.log(`Connected to ${server.url}`);
                client.subscribe(server.topics);
                MQTTProxy._client = client;
                resolve();
                MQTTProxy._scheduleNextPublish();
            });

            // If promise was resolved, won't have any effect, so no problem for future errors
            client.on("error", (err) => {
                reject(err);
            });

            client.on("message", (topic: string, payload: Buffer) => {
                const message = {
                    topic,
                    payload,

                    timestamp: Date.now()
                };

                MQTTProxy._messages[topic] = message;
            });
        });
    }

    /** Disconnect (if connected) */
    public static async disconnect(): Promise<void> {
        let p: Promise<void> = Promise.resolve();
        if (MQTTProxy._client) {
            p = new Promise((resolve, reject) => {
                MQTTProxy._client.end(false, {}, resolve);
            });
        }
        MQTTProxy._client = null;
        return p;
    }

    //#endregion

    //#region Get messages ----------------------------------------------------

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

    public static getScheduledMessages(): ScheduledMQTTMessage[] {
        return MQTTProxy._pendingMessages;
    }

    //#endregion

    //#region Publish ---------------------------------------------------------

    public static async publish(topic: string, payload: Buffer, options: MQTTPublishOptions): Promise<void> {
        let when: number = null; // null = NOW
        if (options.timeout) {
            when = Date.now() + options.timeout;
        }
        if (options.timestamp) {
            when = options.timestamp;
        }

        console.log(`Message planned at ${new Date(when).toLocaleString()}`);

        return new Promise((resolve, reject) => {
            //-- Prepare message to be sent details --
            MQTTProxy._pendingMessages.push({
                topic,
                payload,
                timestamp: when,
                resolve,
                reject
            });
            //-- Make sure there is a timeout pending to send to message --
            MQTTProxy._scheduleNextPublish();
        });
    }

    private static _scheduleNextPublish(): void {
        if (MQTTProxy._timeoutHandle) {
            // If already scheduled, cancel, we will reschedule a new one
            clearTimeout(MQTTProxy._timeoutHandle);
        }

        if (!MQTTProxy.isConnected()) {
            // No need to try to send messages right now, will be rescheduled on reconnect
            return;
        }

        const now = Date.now();
        let nextTimestamp: number = null;
        for (let pending of MQTTProxy._pendingMessages) {
            if (!pending.timestamp || pending.timestamp <= Date.now()) {
                // We need to start it NOW, no need to look if there is something later
                nextTimestamp = null;
                break;
            }

            if (nextTimestamp === null || pending.timestamp < nextTimestamp) {
                nextTimestamp = pending.timestamp;
            }
        }

        const timeout = nextTimestamp ? Math.max(0, nextTimestamp - now) : 0; // Can't be negative
        MQTTProxy._timeoutHandle = setTimeout(MQTTProxy._timeoutCallback, timeout);
    }

    private static _timeoutCallback(): void {
        MQTTProxy._timeoutHandle = null;

        if (!MQTTProxy.isConnected()) {
            // We can't do anything right now, postpone, will be re-scheduled on reconnection
            return;
        }

        const now = Date.now();

        // We create a new list, to keep only still pending messages
        const pendingMessages: ScheduledMQTTMessage[] = MQTTProxy._pendingMessages;
        MQTTProxy._pendingMessages = [];

        //-- Run due callbacks, keep future events --
        for (let pending of pendingMessages) {
            if (!pending.timestamp || pending.timestamp <= now) {
                console.log(`Message planned at ${new Date(pending.timestamp).toLocaleString()}, send at ${new Date(now).toLocaleString()}, real time ${new Date().toLocaleString()}`);
                // We need to trigger this callback
                MQTTProxy._client.publish(pending.topic, pending.payload, (err) => {
                    if (err) {
                        if (pending.reject) pending.reject(err);
                    } else {
                        MQTTProxy._messages[pending.topic] = {
                            topic: pending.topic,
                            payload: pending.payload,
                            timestamp: now
                        };
                        if (pending.resolve) pending.resolve();
                    }
                });
            } else {
                // The message is scheduled in the future, keep it for later
                MQTTProxy._pendingMessages.push(pending);
            }
        }

        //-- Schedule next call --
        MQTTProxy._scheduleNextPublish();
    }

    //#endregion
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
            await MQTTProxy.publish(req.header("Topic"), req.body, tryParseJSON(req.header("Options")));
            res.send("OK");
        } catch (e) {
            res.status(500).send(e);
        }
    });

    return router;
}
