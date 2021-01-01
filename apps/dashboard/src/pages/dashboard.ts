import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { getPage } from '../tools/pages';

export function register() {
    Navigation.register('dashboard', {
        onShow: _onShow
    });
}

async function _onShow(): Promise<void> {
    let $content = $("#dashboard");
    return getPage().then((content) => {
        $content.html(content);
    }).catch((e) => {
        $content.html(`<span class="text-danger">Failed to load dashboard</span>`);
        console.error(e);
    });
}