import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/seti.css';
import 'codemirror/mode/htmlmixed/htmlmixed';

export class Editor {
    protected _editor: CodeMirror.Editor = null; // Lazy init

    constructor(protected _container: HTMLElement, protected _options?: {
        onEscape?: () => void;
        onSave?: (content: string) => void;
    }) {
    };

    get container(): HTMLElement {
        return this._container;
    }

    get content(): string {
        return this._editor.getValue();
    }

    /** Toggle container visibility. Will initialize the editor if needed and fill it with the dashboard config. */
    public edit(content: string) {
        this._initIfNeeded();

        this._editor.setValue(content);
        this._editor.refresh();

        this._editor.focus();
        this._editor.setCursor(0, undefined, {
            scroll: true
        });
    }

    protected _initIfNeeded() {
        if (this._editor) {
            return;
        }

        this._editor = CodeMirror(this._container, {
            mode: "htmlmixed",
            lineNumbers: true,
            theme: "seti",
            smartIndent: true,
            tabSize: 2,
            indentWithTabs: false,
            extraKeys: {
                "Esc": () => {
                    this._options?.onEscape();
                },
                "Ctrl-S": () => {
                    this._options?.onSave(this._editor.getValue());
                }
            }
        });

        this._editor.setSize("100%", "100%");
        this._editor.refresh();
    }
}

