import { Router } from 'express';
import { Service } from '@mqtttoolbox/commons';

export function buildRoutes(services: { [uid: string]: Service }): Router {
    let router = Router();
    router.get("/ping", (req, res) => {
        res.json({ "response": 'pong' });
    });
    for (let uid in services) {
        router.post(`/${uid}`, (req, res) => {
            services[uid](req.params).then((result) => {
                res.json(result);
            }).catch(e => {
                console.error(e);
            });
        });
    }
    return router;
}