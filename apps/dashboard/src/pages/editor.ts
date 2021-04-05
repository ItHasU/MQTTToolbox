import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { ConfigProxy } from '../tools/configProxy';
import { Editor } from '../tools/editor';

var _editor: Editor = null;

export function register() {
  const $container = $("#code-editor");
  _editor = new Editor($container[0], {
    onEscape: () => {
      // Don't save
      $container.hide();
      Navigation.refresh();
    },
    onSave: async (content: string) => {
      // Save
      await ConfigProxy.setValues({
        dashboard: content
      });
      Navigation.show("dashboard");
    }
  });

  window.addEventListener('keydown', async (ev) => {
    if (ev.ctrlKey && ev.code == "KeyE") {
      ev.preventDefault();
      $container.toggle();

      if ($container.is(":visible")) {
        let content = await ConfigProxy.getValue('dashboard');
        _editor.edit(content);
      }
    }
  });
}
