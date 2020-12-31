/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from "path";

import { buildMQTTRouter, MQTTProxy } from './app/mqttProxy';
import { buildPagesRouter } from './app/pages';

import { MQTT_URL, PAGE_URL } from "@mqtttoolbox/commons";
import { Config } from './app/tools/config';

import * as process from 'process';

async function main() {
  //-- Load config ------------------------------------------------------------
  try {
    // //-- Connect to MQTT servers --------------------------------------------------
    // MQTTProxy.connect(config.mqtt);

    //-- Start server -----------------------------------------------------------
    const app = express();
    app.use("/", express.static(path.join(__dirname, "../dashboard/")));
    app.use(MQTT_URL, buildMQTTRouter());
    app.use(PAGE_URL, buildPagesRouter());

    const port: number = Config.getPort();
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
    server.on('error', console.error);
  } catch (err) {
    console.error(err);
    console.error(`App initialisation has failed. Exiting.`)
    process.exit(1);
  }
}

main();
