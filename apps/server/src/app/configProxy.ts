import { Router, json } from "express";
import { Config } from './tools/config';

export function buildConfigRouter(): Router {
    let router: Router = Router();

    router.get("/", async (req, res) => {
        let field: string = req.header("name");
        res.json(await Config.get(<any>field));
    });

    router.post("/", json({ type: "*/*" }), async (req, res) => {
        try {
            let config: { [name: string]: any } = req.body;
            await Config.setMulti(config);
            res.sendStatus(200);
        } catch (e) {
            res.status(500).send(e);
        }
    });

    return router;
}