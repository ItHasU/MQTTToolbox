/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { MQTTProxy } from './app/mqttProxy';
import { parseJSON } from './app/tools/io';
import { Config } from "@mqtttoolbox/commons";

async function main() {
  //-- Load config ------------------------------------------------------------
  try {
    let config: Config = await parseJSON<Config>(process.env.config || "config.json");
    console.log(config);

    //-- Connect to MQTT servers --------------------------------------------------
    let proxy = new MQTTProxy();
    for (let uid in config.mqttServers) {
      proxy.connect(uid, config.mqttServers[uid]);
    }

    // //-- Start server -----------------------------------------------------------
    // const app = express();

    // app.get('/api', (req, res) => {
    //   res.send({ message: 'Welcome to server!' });
    // });

    // const port = process.env.port || 3333;
    // const server = app.listen(port, () => {
    //   console.log(`Listening at http://localhost:${port}/api`);
    // });
    // server.on('error', console.error);
  } catch (err) {
    console.error(err);
  }
}

main();