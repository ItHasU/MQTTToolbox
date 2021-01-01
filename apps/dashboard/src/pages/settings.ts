import * as $ from 'jquery';
import * as Editor from '../tools/editor';

import { Navigation } from '../tools/navigation';
import { ConfigProxy } from '../tools/configProxy';
import { ConfigFile } from '@mqtttoolbox/commons';

export function register() {
  Navigation.register('settings', {
    onInit: _onInit,
    onShow: _onShow
  });
}

async function _onInit(pageName: string, $page: JQuery): Promise<void> {
  //-- Init editor ------------------------------------------------------------
  Editor.initIfNeeded($page.find("#code-editor")[0], {
    onSave: _saveDashboard
  });
  $page.find("#code-editor-save").on('click', _saveDashboard);
  $page.find("#mqtt-save").on('click', async () => _saveMQTT($page));
}

async function _onShow(pageName: string, $page: JQuery): Promise<void> {
  //-- Refresh MQTT settings --------------------------------------------------
  let mqtt = await ConfigProxy.getValue('mqtt');
  $page.find(`#mqtt-url`).val(mqtt.url);
  $page.find(`#mqtt-client`).val(mqtt?.options?.clientId || "");
  $page.find(`#mqtt-password`).val(mqtt?.options?.password || "");
  $page.find(`#mqtt-topics`).val(mqtt?.topics.join(",") || "");

  //-- Refresh editor content -------------------------------------------------
  let content = await ConfigProxy.getValue('dashboard');
  Editor.edit(content);
}

async function _saveDashboard(): Promise<void> {
  try {
    await ConfigProxy.setValues({
      dashboard: Editor.getContent()
    });
  } catch (e) {
    // Failed
    console.error(e);
  }
}

async function _saveMQTT($page: JQuery): Promise<void> {
  try {
    let clientId: string = <string>$page.find(`#mqtt-client`).val().toString();
    if (!clientId) clientId = undefined;

    let password: string = <string>$page.find(`#mqtt-password`).val().toString();
    if (!password) password = undefined;

    let topicsStr: string = <string>$page.find(`#mqtt-topics`).val().toString();
    if (!topicsStr) {
      topicsStr = "#";
    }
    let topics = topicsStr.split(",").map(x => x.trim());

    let mqtt: ConfigFile['mqtt'] = {
      url: $page.find(`#mqtt-url`).val().toString(),
      options: {
        clientId,
        password
      },
      topics
    };

    await ConfigProxy.setValues({
      mqtt: mqtt
    });
  } catch (e) {
    console.error(e);
  }
}
