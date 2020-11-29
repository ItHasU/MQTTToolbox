import * as fs from 'fs';

export async function parseJSON<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
            if (err) {
                reject(err);
            }
            try {
                let res: T = JSON.parse(data);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    });
}