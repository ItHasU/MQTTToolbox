import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { MQTTProxy } from '../tools/mqttProxy';

export function register() {
    Navigation.register('schedule', {
        onShow: _onShow
    });
}

async function _onShow(): Promise<void> {
    let $content = $("#schedule-table");
    $content.empty();
    return MQTTProxy.getScheduled().then((messages) => {
        let lines: string = '';
        for (let message of messages) {
            lines += `<tr>
                <td>${new Date(message.timestamp).toLocaleString()}</td>
                <td>${message.topic}</td>
                <td>${message.payload}</td>
            </tr>`;
        }
        $content.append(lines);
    }).catch((e) => {
        console.error(e);
    });
}
