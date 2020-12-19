import { MQTT_URL, MQTT_API, MQTTMessage } from '@mqtttoolbox/commons';

const INTERVAL_MS: number = 1000;
type MQTTMessageCallback = (msg: MQTTMessage) => void;

export class MQTTProxy {
    private static _messages: { [topic: string]: MQTTMessage } = {};
    private static _callbacks: { [topic: string]: MQTTMessageCallback[] } = {};
    // private static _services: MQTT_API = {
    //     getUpdate: null,
    //     publish: null
    // };
    private static _lastUpdate: number = null;

    public static init(): void {
        // bindServices(MQTT_URL, <any>MQTTProxy._services);
        MQTTProxy._scheduleUpdate();
    }

    public static get(topic: string): MQTTMessage {
        return MQTTProxy._messages[topic];
    }

    public static on(topic: string, callback: MQTTMessageCallback): void {
        if (!MQTTProxy._callbacks[topic]) {
            MQTTProxy._callbacks[topic] = [];
        }
        MQTTProxy._callbacks[topic].push(callback);
    }

    public static publish(topic: string, payload: string | Buffer | any): Promise<void> {
        let payloadBuffer: Buffer = null;
        if (payload instanceof Buffer) {
            payloadBuffer = payload;
        } else if (typeof payload === 'string') {
            payloadBuffer = Buffer.from(<string>payload, 'utf-8');
        } else {
            payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf-8');
        }

        return fetch(`${MQTT_URL}/publish`, {
            method: 'POST',
            headers: <any>{
                'Topic': topic,
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
        let params = MQTTProxy._lastUpdate ? `?after=${MQTTProxy._lastUpdate}` : "";
        fetch(`${MQTT_URL}/all${params}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
