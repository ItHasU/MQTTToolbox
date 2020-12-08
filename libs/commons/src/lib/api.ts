import { MQTTMessage } from './definitions';

export const MQTT_URL: string = "/mqtt";

export interface MQTT_API {
    getUpdate: (args: { after: number }) => Promise<MQTTMessage[]>;
    publish: (args: MQTTMessage) => Promise<void>;
}
