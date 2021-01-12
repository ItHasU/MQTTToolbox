import { MQTT_URL, MQTTMessage, MQTTPublishOptions } from '@mqtttoolbox/commons';

const INTERVAL_MS: number = 2000;
type MQTTMessageCallback = (msg: MQTTMessage) => void;

export class MQTTProxy {
    private static _messages: { [topic: string]: MQTTMessage } = {};
    private static _callbacks: { [topic: string]: MQTTMessageCallback[] } = {};
    private static _lastUpdate: number = null;
    private static _encoder: TextEncoder = new TextEncoder();

    public static init(): void {
        MQTTProxy._scheduleUpdate();
    }

    public static list(): string[] {
        return Object.keys(MQTTProxy._messages);
    }

    public static get(topic: string): MQTTMessage {
        return MQTTProxy._messages[topic];
    }

    /** List scheduled messages */
    public static getScheduled(): Promise<MQTTMessage[]> {
        return fetch(`${MQTT_URL}/scheduled`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.text();
        }).then((text: string) => {
            return _jsonParse(text);
        });
    }

    public static on(topic: string, callback: MQTTMessageCallback): void {
        if (!MQTTProxy._callbacks[topic]) {
            MQTTProxy._callbacks[topic] = [];
        }
        MQTTProxy._callbacks[topic].push(callback);
    }

    public static publish(topic: string, payload: any, options: MQTTPublishOptions): Promise<void> {
        let payloadBuffer: ArrayBuffer = null;
        if (payload instanceof ArrayBuffer) {
            payloadBuffer = payload;
        } else if (typeof payload === 'string') {
            payloadBuffer = MQTTProxy._encoder.encode(<string>payload);
        } else {
            payloadBuffer = MQTTProxy._encoder.encode(JSON.stringify(payload));
        }

        return fetch(`${MQTT_URL}/publish`, {
            method: 'POST',
            headers: <any>{
                'Topic': topic,
                'Options': options ? JSON.stringify(options) : undefined,
                'Content-Type': 'application/octet-stream'
            },
            body: payloadBuffer
        }).then((response) => {
            MQTTProxy._messages[topic] = {
                topic,
                payload,
                timestamp: new Date().getTime()
            }
        });
    }

    private static _scheduleUpdate(): void {
        var nextUpdate = new Date().getTime();
        fetch(`${MQTT_URL}/all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'After': `${MQTTProxy._lastUpdate}`
            }
        }).then((response) => {
            return response.text();
        }).then((text: string) => {
            return _jsonParse(text);
        }).then((messages) => {
            for (let message of messages) {
                let lastMessage = MQTTProxy._messages[message.topic];
                MQTTProxy._messages[message.topic] = message;
                if (!lastMessage || lastMessage.timestamp != message.timestamp) {
                    // Trigger callbacks
                    let callbacks = this._callbacks[message.topic];
                    if (callbacks) {
                        for (let cb of callbacks) {
                            cb(message);
                        }
                    }
                }
            }
            MQTTProxy._lastUpdate = nextUpdate;
        }).catch(e => {
            console.error(e);
            MQTTProxy._lastUpdate = null; // Force full update on next call
        }).then(() => {
            setTimeout(() => {
                MQTTProxy._scheduleUpdate();
            }, INTERVAL_MS);
        });
    }
}

function _jsonParse(content) {
    try {
        return JSON.parse(content, (k, v) => {
            if (v !== null && typeof v === 'object' && 'type' in v && v.type === 'Buffer' && 'data' in v && Array.isArray(v.data)) {
                return new Uint8Array(v.data);
            }
            return v;
        });
    } catch (e) {
        console.error(e);
    }
}
