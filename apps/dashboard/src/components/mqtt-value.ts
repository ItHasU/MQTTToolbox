import { MQTTMessage } from '@mqtttoolbox/commons';
import { MQTTProxy } from '../tools/mqttProxy';

enum ATTRIBUTES {
    TOPIC = "topic",
    PATH = "path"
}

export class MQTTValueElement extends HTMLElement {
    public static observedAttributes = [];
    private _reader: Function;

    constructor() {
        super();
    }

    public connectedCallback() {
        const path = this.getAttribute(ATTRIBUTES.PATH) ?? "";
        this._reader = new Function("$", `return $${path}`);

        let topic = this.getAttribute(ATTRIBUTES.TOPIC);
        MQTTProxy.on(topic, this._update.bind(this));

        this._update(MQTTProxy.get(topic));
    }

    private _update(msg: MQTTMessage) {
        if (!msg) {
            this.innerHTML = "--";
            return;
        }

        try {
            let value = msg.payload;
            let valueStr = new TextDecoder("utf-8").decode(value);
            //let entryStr = this._reader(JSON.parse(valueStr));
            this.innerHTML = valueStr;
        } catch (e) {
            console.error(e);
            this.innerHTML = "xx";
        }
    }
}

customElements.define('mqtt-value', MQTTValueElement);
