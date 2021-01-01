import { Router, text } from "express";
import { Config } from './tools/config';

async function _savePage(content: string): Promise<void> {
    return Config.set('dashboard', content);
}

export function buildPagesRouter(): Router {
    let router: Router = Router();

    router.get("/", async (req, res) => {
        res.header("Content-Type", "text/html");
        res.send(await Config.get('dashboard', ""));
    });

    router.post("/", text({ type: "*/*" }), async (req, res) => {
        try {
            await _savePage(req.body);
            res.sendStatus(200);
        } catch (e) {
            res.status(500).send(e);
        }
    });

    return router;
}