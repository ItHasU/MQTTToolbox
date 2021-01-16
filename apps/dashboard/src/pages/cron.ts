import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { ConfigProxy } from '../tools/configProxy';

export function register() {
    Navigation.register('cron', {
        onShow: _onShow
    });
}

async function _onShow(): Promise<void> {
}
