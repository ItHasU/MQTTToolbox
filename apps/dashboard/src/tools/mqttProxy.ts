import { MQTT_URL, MQTT_API, MQTTMessage } from '@mqtttoolbox/commons';
import { bindServices } from './express';

const INTERVAL_MS: number = 1000;

export class MQTTProxy {
    private static _messages: { [topic: string]: MQTTMessage } = {};
    private static _services: MQTT_API = {
        getUpdate: null,
        publish: null
    };
    private static _lastUpdate: number = null;

    public static init(): void {
        bindServices(MQTT_URL, <any>MQTTProxy._services);
        MQTTProxy._scheduleUpdate();
    }

    public static publish(topic: string, payload: any): Promise<void> {
        return MQTTProxy._services.publish({ topic, payload, timestamp: new Date().getTime(), source: "browser" });
    }

    private static _scheduleUpdate(): void {
        var nextUpdate = new Date().getTime();

        MQTTProxy._services.getUpdate({
            after: MQTTProxy._lastUpdate
        }).then((messages) => {
            for (let message of messages) {
                MQTTProxy._messages[message.topic] = message;
                if (message.timestamp >= MQTTProxy._lastUpdate) {
                    console.log(MQTTProxy._lastUpdate, message);
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
