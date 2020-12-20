import { MQTTMessage } from '@mqtttoolbox/commons';
import { MQTTValueElement } from './mqtt-value';

enum ATTRIBUTES {
    PATH = "path"
}

export class MQTTJSONElement extends MQTTValueElement {
    private _reader: Function;

    constructor() {
        super();
    }

    public connectedCallback() {
        const path = this.getAttribute(ATTRIBUTES.PATH) ?? "";
        this._reader = new Function("$", `return $${path}`);

        super.connectedCallback();
    }

    protected _update(msg: MQTTMessage) {
        if (!msg) {
            this._shadowRoot.innerHTML = "--";
            return;
        }

        try {
            let value = msg.payload;
            let valueStr = new TextDecoder("utf-8").decode(value);
            let entryStr = this._reader(JSON.parse(valueStr));
            this._shadowRoot.innerHTML = entryStr;
        } catch (e) {
            console.error(e);
            this._shadowRoot.innerHTML = "xx";
        }
    }
}

customElements.define('mqtt-json', MQTTJSONElement);
