import * as fs from 'fs';

function parseJSONWithBuffer(text: string) {
    return JSON.parse(text, (k, v) => {
        if (
            v !== null &&
            typeof v === 'object' &&
            'type' in v &&
            v.type === 'Buffer' &&
            'data' in v &&
            Array.isArray(v.data)) {
            return Buffer.from(v.data);
        }
        return v;
    });
}

export async function parseJSON<T>(path: string): Promise<T> {
    return parseText(path).then((text) => {
        return <T>parseJSONWithBuffer(text);
    });
}

export async function parseText(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export async function saveText(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, { encoding: 'utf-8' }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}