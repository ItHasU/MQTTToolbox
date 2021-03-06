import * as $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import "./components/mqtt-value";
import "./components/mqtt-json";
import "./components/mqtt-date";
import "./components/mqtt-age";
import "./components/mqtt-if";

import { MQTTProxy } from './tools/mqttProxy';
import { Navigation } from './tools/navigation';
import * as PageDashboard from './pages/dashboard';
import * as PageSettings from './pages/settings';
import * as PageStatus from './pages/status';
import * as CronPage from './pages/cron';
import * as Editor from './pages/editor';

(<any>window).MQTT = MQTTProxy;

function main() {
    //-- Install navigation, pages --
    Navigation.install();
    Editor.register();
    PageDashboard.register();
    PageSettings.register();
    PageStatus.register();
    CronPage.register();

    //-- Load data --
    MQTTProxy.init();

    //-- Start page --
    Navigation.show('dashboard');
}

$(main);
