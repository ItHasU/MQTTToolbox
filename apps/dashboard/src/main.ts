import * as $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import "./components/mqtt-value";

import './app/app.element.ts';
import { MQTTProxy } from './tools/mqttProxy';

import * as monaco from "monaco-editor";

(<any>window).MQTT = MQTTProxy;
MQTTProxy.init();

// Through the options literal, the behaviour of the editor can be easily customized.
// Here are a few examples of config options that can be passed to the editor.
// You can also call editor.updateOptions at any time to change the options.
$(() => {
    var editor: monaco.editor.IStandaloneCodeEditor = null;
    const $dashboard = $("#dashboard");
    console.log($("#code-editor-toggle"));
    $("#code-editor-toggle").click(() => {
        console.log("click");
        const $sidePanel = $("#side-panel");
        if ($sidePanel.is(":visible")) {
            $sidePanel.hide().removeClass("d-flex");
        } else {
            $sidePanel.addClass("d-flex").show();
            editor.layout();
        }
    });
    $("#code-editor-save").click(() => {
        $dashboard[0].innerHTML = editor.getValue();
    });
    $("#code-editor-format").click(() => {
        let action = editor.getAction('editor.action.formatDocument');
        if (action) action.run();
    })
    window.onresize = () => {
        editor.layout();
    };
    editor = monaco.editor.create(
        $("#code-editor")[0],
        {
            value: $dashboard[0].innerHTML,
            language: "html",

            lineNumbers: "on",
            roundedSelection: true,
            readOnly: false,
            theme: "vs-dark",
        });
});