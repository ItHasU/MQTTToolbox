import * as $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/seti.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import "./components/mqtt-value";

import './app/app.element.ts';
import { MQTTProxy } from './tools/mqttProxy';

(<any>window).MQTT = MQTTProxy;
MQTTProxy.init();

// Through the options literal, the behaviour of the editor can be easily customized.
// Here are a few examples of config options that can be passed to the editor.
// You can also call editor.updateOptions at any time to change the options.
$(() => {
    // var editor: monaco.editor.IStandaloneCodeEditor = null;
    const $dashboard = $("#dashboard");
    const $sidePanel = $("#side-panel");

    var editor = CodeMirror($("#code-editor")[0], {
        value: $dashboard[0].innerHTML,
        mode: "htmlmixed",
        lineNumbers: true,
        theme: "seti",
        smartIndent: true,
        tabSize: 2,
        indentWithTabs: false,
        extraKeys: {
            "Esc": () => {
                hideEditor();
            },
            "Ctrl-S": () => {
                $dashboard[0].innerHTML = editor.getValue();
            }
        }
    });
    editor.setSize("100%", "100%");
    editor.refresh();

    $("#code-editor-toggle").click(() => {
        if ($sidePanel.is(":visible")) {
            hideEditor();
        } else {
            showEditor();
        }
    });

    function showEditor() {
        $sidePanel.addClass("d-flex").show();
        editor.refresh();
        editor.setValue($dashboard[0].innerHTML);

        editor.focus();
        editor.setCursor(0, undefined, {
            scroll: true
        });
    }

    function hideEditor() {
        $sidePanel.hide().removeClass("d-flex");
    }
});