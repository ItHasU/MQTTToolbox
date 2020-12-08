import { Service } from "@mqtttoolbox/commons";

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
                return response.json();
            }).then((data: any) => {
                return data;
            }).catch((e) => {
                console.error(e);
                // Forward error
                return Promise.reject(e);
            });
        }
    }
}
