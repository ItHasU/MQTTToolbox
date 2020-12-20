/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from "path";

import { buildMQTTRouter, MQTTProxy } from './app/mqttProxy';
import { buildPagesRouter } from './app/pages';

import { Config, MQTT_URL, PAGE_URL } from "@mqtttoolbox/commons";
import { getConfig } from './app/tools/config';

async function main() {
  //-- Load config ------------------------------------------------------------
  try {
    let config: Config = await getConfig();

    //-- Connect to MQTT servers --------------------------------------------------
    await MQTTProxy.connect(config.mqtt);

    //-- Start server -----------------------------------------------------------
    const app = express();
    app.use("/", express.static(path.join(__dirname, "../dashboard/")));
    app.use(MQTT_URL, buildMQTTRouter());
    app.use(PAGE_URL, buildPagesRouter());

    const port = config?.http?.port || 3333;
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
    server.on('error', console.error);
  } catch (err) {
    console.error(err);
  }
}

main();