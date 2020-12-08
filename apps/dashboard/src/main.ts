//import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './app/app.element.ts';
import { MQTTProxy } from './tools/mqttProxy';

(<any>window).MQTT = MQTTProxy;
MQTTProxy.init();

(<any>window).mqtt = async function (topic: string, message: any): Promise<void> {
    console.log(`>${topic} ${message}`);
    return Promise.resolve();
}
