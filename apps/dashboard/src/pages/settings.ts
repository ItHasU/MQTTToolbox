import * as $ from 'jquery';
import * as Editor from '../tools/editor';

import { Navigation } from '../tools/navigation';
import { getPage, savePage } from '../tools/pages';

export function register() {
  Navigation.register('settings', {
    onInit: _onInit,
    onShow: _onShow
  });
}

async function _onInit(pageName: string, $page: JQuery): Promise<void> {
  //-- Init editor ------------------------------------------------------------
  Editor.initIfNeeded($page.find("#code-editor")[0], {
    onSave: _save
  });
  // $("#code-editor-save-item").show();
  // $sidePanel.addClass("d-flex").show();
  // Editor.edit($dashboardContent[0].innerHTML);

}

async function _onShow(): Promise<void> {
  //-- Refresh editor content -------------------------------------------------
  let content = await getPage();
  Editor.edit(content);
}

function _save(): void {
  // try {
  //   await save(Editor.getContent());
  // } catch (e) {
  //   // Failed
  //   console.error(e);
  // }
}

// $("#code-editor-save").on('click', async () => {
// });

//#region Editor callbacks ----------------------------------------------------

// function toggleEditor() {
//     if ($sidePanel.is(":visible")) {
//         hideEditor();
//     } else {
//         showEditor();
//     }
// }

// function showEditor() {
//     Editor.initIfNeeded($("#code-editor")[0], {
//         onEscape: hideEditor,
//         onSave: save
//     });
//     $("#code-editor-save-item").show();
//     $sidePanel.addClass("d-flex").show();
//     Editor.edit($dashboardContent[0].innerHTML);
// }

// function hideEditor() {
//     $("#code-editor-save-item").hide();
//     $sidePanel.hide().removeClass("d-flex");
// }

// async function save(content: string): Promise<void> {
//     try {
//         await savePage(content);
//     } catch (e) {
//         console.error(e);
//     } finally {
//         $dashboardContent[0].innerHTML = content;
//     }
// }


//#endregion
