import * as mqtt from 'mqtt';
import { MQTTServerOptions } from '@mqtttoolbox/commons';

enum ClientStatus {
    CONNECTING,
    FAILED,
    CONNECTED
}
interface MessageInfo {
    payload: Buffer;
    timestamp: Date;
}

interface ClientInfo {
    client: mqtt.Client;
    status: ClientStatus;
    storage: { [topic: string]: MessageInfo };
}

export class MQTTProxy {
    private readonly _clients: { [uid: string]: ClientInfo } = {};

    public async connect(uid: string, server: MQTTServerOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const infos: ClientInfo = {
                client: mqtt.connect(server.url, server.options),
                status: ClientStatus.CONNECTING,
                storage: {}
            };
            this._clients[uid] = infos;

            infos.client.on("connect", () => {
                infos.client.subscribe(server.topics);
                infos.status = ClientStatus.CONNECTED;
                resolve();
            });

            // If promise was resolved, won't have any effect, so no problem for future errors
            infos.client.on("error", (err) => {
                infos.status = ClientStatus.FAILED;
                reject(err);
            });

            infos.client.on("message", (topic: string, payload: Buffer) => {
                infos.storage[topic] = {
                    payload,
                    timestamp: new Date()
                };
                console.log(`${new Date().toLocaleString()} ${topic} ${payload}`);
            });
        });
    }

    public get(uid: string, topic: string): MessageInfo {
        return this._clients[uid]?.storage[topic];
    }
}
