import * as express from 'express';
import * as path from "path";

import { buildMQTTRouter, MQTTProxy } from './app/mqttProxy';
import { buildConfigRouter } from './app/configProxy';

import { MQTT_URL, CONFIG_URL } from "@mqtttoolbox/commons";
import { Config } from './app/tools/config';

import * as process from 'process';

async function main() {
  //-- Load config ------------------------------------------------------------
  try {
    //-- Connect to MQTT servers ----------------------------------------------
    Config.on("mqtt", (name, value) => {
      console.log(`MQTT configuration has changed`);
      MQTTProxy.connect(value);
    });

    //-- Start server ---------------------------------------------------------
    const app = express();
    app.use("/", express.static(path.join(__dirname, "../dashboard/")));
    app.use(MQTT_URL, buildMQTTRouter());
    app.use(CONFIG_URL, buildConfigRouter());

    const port: number = Config.getPort();
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
    server.on('error', console.error);

    //-- Config loading -------------------------------------------------------
    Config.reload();
  } catch (err) {
    console.error(err);
    console.error(`App initialisation has failed. Exiting.`)
    process.exit(1);
  }
}

main();
