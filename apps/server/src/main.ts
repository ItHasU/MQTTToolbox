/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as mqtt from 'mqtt';

const app = express();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

const mqttURL = process.env.mqtt || "mqtt://test.mosquitto.org"

let client = mqtt.connect(mqttURL);
client.on("connect", () => {
  client.subscribe('#');
});

client.on("message", (topic, payload) => {
  console.log(`${topic} ${payload}`);
});