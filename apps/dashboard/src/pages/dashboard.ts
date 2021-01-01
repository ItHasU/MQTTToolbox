import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { ConfigProxy } from '../tools/configProxy';

export function register() {
    Navigation.register('dashboard', {
        onShow: _onShow
    });
}

async function _onShow(): Promise<void> {
    let $content = $("#dashboard");
    return ConfigProxy.getValue('dashboard').then((content) => {
        $content.html(content);
    }).catch((e) => {
        $content.html(`<span class="text-danger">Failed to load dashboard</span>`);
        console.error(e);
    });
}
