import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/seti.css';
import 'codemirror/mode/htmlmixed/htmlmixed';

var _container: HTMLElement = null;
var _editor: CodeMirror.Editor = null;

export function initIfNeeded(container: HTMLElement, options?: {
    onEscape?: () => void;
    onSave?: (content: string) => void;
}) {
    if (_editor) {
        return;
    }

    _container = container;
    _editor = CodeMirror(_container, {
        mode: "htmlmixed",
        lineNumbers: true,
        theme: "seti",
        smartIndent: true,
        tabSize: 2,
        indentWithTabs: false,
        extraKeys: {
            "Esc": () => {
                options?.onEscape();
            },
            "Ctrl-S": () => {
                options?.onSave(_editor.getValue());
            }
        }
    });

    _editor.setSize("100%", "100%");
    _editor.refresh();
}

export function edit(content: string) {
    if (!_editor) return;

    _editor.setValue(content);
    _editor.refresh();

    _editor.focus();
    _editor.setCursor(0, undefined, {
        scroll: true
    });

}