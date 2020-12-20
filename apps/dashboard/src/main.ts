import * as $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import "./components/mqtt-value";
import "./components/mqtt-json";

import { MQTTProxy } from './tools/mqttProxy';
import * as Editor from './tools/editor';
import { getPage } from './tools/pages';

(<any>window).MQTT = MQTTProxy;

let $dashboard: JQuery = null;
let $sidePanel: JQuery = null;

function main() {
    $dashboard = $("#dashboard");
    $sidePanel = $("#side-panel");

    //-- Bind events ----------------------------------------------------------
    $("#code-editor-toggle").on('click', toggleEditor);

    //-- Load data ------------------------------------------------------------
    MQTTProxy.init();
    getPage().then((content) => {
        $dashboard[0].innerHTML = content;
    }).catch((e) => {
        console.error(e);
    });
}

//#region Editor callbacks ----------------------------------------------------

function toggleEditor() {
    if ($sidePanel.is(":visible")) {
        hideEditor();
    } else {
        showEditor();
    }
}

function showEditor() {
    Editor.initIfNeeded($("#code-editor")[0]);

    $sidePanel.addClass("d-flex").show();
    Editor.edit($dashboard[0].innerHTML);
}

function hideEditor() {
    $sidePanel.hide().removeClass("d-flex");
}

//#endregion

$(main);
