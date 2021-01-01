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
import * as Editor from './tools/editor';
import { getPage, savePage } from './tools/pages';
import { Navigation } from './tools/navigation';

(<any>window).MQTT = MQTTProxy;

let $dashboard: JQuery = null;
let $sidePanel: JQuery = null;

function main() {
    Navigation.install();
    Navigation.loadPage('dashboard');

    $dashboard = $("#dashboard");
    $sidePanel = $("#side-panel");

    //-- Bind events ----------------------------------------------------------
    $("#code-editor-toggle").on('click', toggleEditor);
    $("#code-editor-save").on('click', async () => {
        try {
            await save(Editor.getContent());
            hideEditor();
        } catch (e) {
            // Failed
            console.error(e);
        }
    });

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
    Editor.initIfNeeded($("#code-editor")[0], {
        onEscape: hideEditor,
        onSave: save
    });
    $("#code-editor-save-item").show();
    $sidePanel.addClass("d-flex").show();
    Editor.edit($dashboard[0].innerHTML);
}

function hideEditor() {
    $("#code-editor-save-item").hide();
    $sidePanel.hide().removeClass("d-flex");
}

async function save(content: string): Promise<void> {
    try {
        await savePage(content);
    } catch (e) {
        console.error(e);
    } finally {
        $dashboard[0].innerHTML = content;
    }
}


//#endregion

$(main);
