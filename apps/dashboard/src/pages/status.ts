import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { MQTTProxy } from '../tools/mqttProxy';
import { MQTTMessage } from '@mqtttoolbox/commons';

var autoRefreshTimeout: any = null;

export function register() {
    Navigation.register('status', {
        onInit: _onInit,
        onShow: _onShow,
        onHide: _onHide
    });
}

async function _onInit(): Promise<void> {
    $(`#status a[data-action="refresh"]`).on('click', (e) => {
        e.preventDefault();
        Navigation.refresh();
    });
}

async function _onShow(): Promise<void> {
    if (autoRefreshTimeout) clearTimeout(autoRefreshTimeout);
    autoRefreshTimeout = null;

    const $messagesTBody = $('#status-messages-table');
    fillTable($messagesTBody, MQTTProxy.getAll());

    let $pendingTBody = $("#status-pending-table");
    MQTTProxy.getScheduled().then((messages) => {
        fillTable($pendingTBody, messages);
    }).catch((e) => {
        $pendingTBody.empty();
        $pendingTBody.append(`<div class"text-danger">Failed to fetch scheduled messages</div>`);
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

function fillTable($tbody: JQuery, messages: MQTTMessage[]): void {
    $tbody.empty();
    const decoder = new TextDecoder('utf-8');
    for (let message of messages) {
        let bufferHTML = `<i>Binary</i>`;
        try {
            bufferHTML = decoder.decode(message.payload);
        } catch (e) {
            // Don't care
        }
        let line = `<tr>`;
        if ('id' in message) {
            line += `<td><a href="javascript:void(0)" data-action="delete"><i class="bi bi-trash text-danger"> </i></td>`;
        }
        line += `<td>${new Date(message.timestamp).toLocaleString()}</td>
                 <td>${message.topic}</td>
                 <td>${bufferHTML}</td>
               </tr>`;
        let $line = $(line);
        $line.find("a[data-action='delete']").on("click", (e) => {
            e.preventDefault();

            MQTTProxy.cancelScheduled((<any>message).id).catch((e) => {
                console.error(e);
            }).then(() => {
                return Navigation.refresh();
            });
        });
        $tbody.append($line);
    }
}