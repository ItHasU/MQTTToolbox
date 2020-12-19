import { Router } from 'express';
import { Service } from '@mqtttoolbox/commons';
import * as express from "express";

export function buildRoutes(services: { [uid: string]: Service }): Router {
    let router = Router();
    router.use(express.json()) // for parsing application/json in body

    for (let uid in services) {
        router.post(`/${uid}`, (req, res) => {
            services[uid](req.body).then((result) => {
                res.json(result);
            }).catch(e => {
                console.error(e);
                res.sendStatus(501).send("Internal error");
            });
        });
    }
    return router;
}
