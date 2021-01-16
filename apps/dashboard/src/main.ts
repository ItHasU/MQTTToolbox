import * as $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import "./components/mqtt-value";
import "./components/mqtt-json";
import "./components/mqtt-date";
import "./components/mqtt-age";

import { MQTTProxy } from './tools/mqttProxy';
import { Navigation } from './tools/navigation';
import * as PageDashboard from './pages/dashboard';
import * as PageSettings from './pages/settings';
import * as PageSchedule from './pages/schedule';
import * as PageStatus from './pages/status';

(<any>window).MQTT = MQTTProxy;

function main() {
    //-- Install navigation, pages --
    Navigation.install();
    PageDashboard.register();
    PageSettings.register();
    PageSchedule.register();
    PageStatus.register();

    //-- Load data --
    MQTTProxy.init();

    //-- Start page --
    Navigation.show('dashboard');
}

$(main);
