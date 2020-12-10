import { Service } from "@mqtttoolbox/commons";

function parse(content) {
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

export function bindServices(baseURL: string, services: { [uid: string]: Service }): void {
    for (let uid in services) {
        services[uid] = (params: any) => {
            return fetch(`${baseURL}/${uid}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            }).then((response: Response) => {
                return response.text();
            }).then((data: string) => {
                return parse(data);
            }).catch((e) => {
                console.error(e);
                // Forward error
                return Promise.reject(e);
            });
        }
    }
}
