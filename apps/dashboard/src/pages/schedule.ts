import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { MQTTProxy } from '../tools/mqttProxy';

var autoRefreshTimeout: any = null;

export function register() {
    Navigation.register('schedule', {
        onInit: _onInit,
        onShow: _onShow,
        onHide: _onHide
    });
}

async function _onInit(): Promise<void> {
    $(`#schedule_refresh`).on('click', (e) => {
        e.preventDefault();
        Navigation.refresh();
    });
}

async function _onShow(): Promise<void> {
    let $content = $("#schedule-table");
    MQTTProxy.getScheduled().then((messages) => {
        $content.empty();
        const decoder = new TextDecoder('utf-8');
        for (let message of messages) {
            let bufferHTML = `<i>Binary</i>`;
            try {
                bufferHTML = decoder.decode(message.payload);
            } catch (e) {
                // Don't care
            }
            let $line = $(`<tr>
                <td><a href="javascript:void(0)"><i class="bi bi-trash text-danger"> </i></td>
                <td>${new Date(message.timestamp).toLocaleString()}</td>
                <td>${message.topic}</td>
                <td>${bufferHTML}</td>
            </tr>`);
            $line.find("a").on("click", (e) => {
                e.preventDefault();
                MQTTProxy.cancelScheduled(message.id).catch((e) => {
                    console.error(e);
                }).then(() => {
                    return Navigation.refresh();
                });
            });
            $content.append($line);
        }
    }).catch((e) => {
        $content.empty();
        $content.append(`<div class"text-danger">Failed to fetch scheduled messages</div>`);
        console.error(e);
    });

    autoRefreshTimeout = setTimeout(() => {
        Navigation.refresh();
    }, 10000);
}

async function _onHide(): Promise<void> {
    if (autoRefreshTimeout) clearTimeout(autoRefreshTimeout);
    autoRefreshTimeout = null;
}
