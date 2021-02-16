import * as express from 'express';
import * as path from "path";

import { buildMQTTRouter, MQTTProxy } from './app/mqttProxy';
import { buildConfigRouter } from './app/configProxy';

import { MQTT_URL, CONFIG_URL, MQTTMessage } from "@mqtttoolbox/commons";
import { Config } from './app/tools/config';

import * as process from 'process';
import { CronScheduler } from './app/cron';

async function persistBeforeExit() {
  console.log("Persisting scheduled messages ...");
  let scheduledMessages: MQTTMessage[] = [];
  for (let message of MQTTProxy.getScheduledMessages()) {
    scheduledMessages.push({
      topic: message.topic,
      payload: message.payload,
      timestamp: message.timestamp
    });
  }
  console.log("Saving config ...");
  await Config.set('scheduledMessages', scheduledMessages);
  console.log(`Persisted ${scheduledMessages.length} message(s)`);
}

async function main() {
  try {
    //-- Init Cron scheduler --------------------------------------------------
    // It will start automatically on Config loading
    CronScheduler.start();

    //-- Bind config & MQTT connection ----------------------------------------
    Config.on("mqtt", (name, value) => {
      console.log(`MQTT configuration has changed`);
      MQTTProxy.connect(value);
    });
    let mqttConfig = await Config.get("mqtt");
    /* await */ MQTTProxy.connect(mqttConfig); // Do not wait, continue initializing the app

    //-- Start server ---------------------------------------------------------
    const app = express();
    app.use("/", express.static(path.join(__dirname, "../dashboard/")));
    app.use(MQTT_URL, buildMQTTRouter());
    app.use(CONFIG_URL, buildConfigRouter());
    app.use("/exit", async (req, res) => {
      res.send("Exiting...");
      await persistBeforeExit();
      setTimeout(() => {
        process.exit(2);
      }, 500);
    });

    const port: number = Config.getPort();
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
    server.on('error', console.error);

    //-- Scheduled messages handling on exit/restart --------------------------
    process.on('SIGINT', persistBeforeExit);

    //-- Config loading -------------------------------------------------------
    // Once everything is ready, we reload the configuration
    let scheduled = await Config.get('scheduledMessages');
    if (scheduled) {
      // Re-schedule previous messages
      for (let message of scheduled) {
        MQTTProxy.publish(message.topic, message.payload, { timestamp: message.timestamp });
      }
      // Erase messages from config
    }
    Config.set('scheduledMessages', undefined);
  } catch (err) {
    console.error(err);
    console.error(`App initialisation has failed. Exiting.`)
    process.exit(1);
  }
}

main();
