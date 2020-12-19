/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { buildMQTTRouter, MQTTProxy } from './app/mqttProxy';
import { parseJSON } from './app/tools/io';
import { Config, MQTT_URL } from "@mqtttoolbox/commons";

import * as path from "path";

async function main() {
  //-- Load config ------------------------------------------------------------
  try {
    let config: Config = await parseJSON<Config>(process.env.config || "config.json");

    //-- Connect to MQTT servers --------------------------------------------------
    await MQTTProxy.connect(config.server);

    //-- Start server -----------------------------------------------------------
    const app = express();
    app.use("/", express.static(path.join(__dirname, "../dashboard/")));
    app.use(MQTT_URL, buildMQTTRouter());

    const port = process.env.port || 3333;
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
    server.on('error', console.error);
  } catch (err) {
    console.error(err);
  }
}

main();