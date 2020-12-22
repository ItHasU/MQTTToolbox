import { Router, text } from "express";
import { saveText } from "./tools/io";

import * as path from "path";
import { getConfigFolder } from "./tools/config";

function _getPagePath(): string {
    return path.join(getConfigFolder(), "dashboard.html");
}

async function _savePage(content: string): Promise<void> {
    let pagePath = _getPagePath();
    return saveText(pagePath, content);
}

export function buildPagesRouter(): Router {
    let router: Router = Router();

    router.get("/", (req, res) => {
        res.header("Content-Type", "text/html");
        res.sendFile(_getPagePath());
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