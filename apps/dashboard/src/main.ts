//import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import "./components/mqtt-value";

import './app/app.element.ts';
import { MQTTProxy } from './tools/mqttProxy';

(<any>window).MQTT = MQTTProxy;
MQTTProxy.init();
