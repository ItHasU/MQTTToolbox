import { Router, text } from "express";
import { getConfigValue, setConfigValue } from './tools/config';

const CONFIG_PAGE: string = 'dashboard';

async function _savePage(content: string): Promise<void> {
    return setConfigValue(CONFIG_PAGE, content);
}

export function buildPagesRouter(): Router {
    let router: Router = Router();

    router.get("/", async (req, res) => {
        res.header("Content-Type", "text/html");
        res.send(await getConfigValue(CONFIG_PAGE, ""));
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