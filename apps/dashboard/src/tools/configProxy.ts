import { ConfigFile, CONFIG_URL } from "@mqtttoolbox/commons";

export class ConfigProxy {

    public static async getValue<K extends keyof ConfigFile>(name: K): Promise<ConfigFile[K]> {
        return fetch(CONFIG_URL, {
            method: 'GET',
            headers: {
                name
            }
        }).then((response) => {
            return response.json();
        });
    }

    public static async setValues(config: Partial<ConfigFile>): Promise<void> {
        return fetch(CONFIG_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "text/html"
            },
            body: JSON.stringify(config)
        }).then(() => {
            // Nothing more to be done, return void
        });
    }
}
