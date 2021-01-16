import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { MQTTProxy } from '../tools/mqttProxy';

export function register() {
    Navigation.register('schedule', {
        onShow: _onShow
    });
}

async function _onShow(): Promise<void> {
}
