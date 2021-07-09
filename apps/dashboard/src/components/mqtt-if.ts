import { MQTTMessage } from '@mqtttoolbox/commons';
import { MQTTProxy } from '../tools/mqttProxy';

enum ATTRIBUTES {
    TOPIC = "topic",
    PATH = "path",
    EQUALS = "equals",
    NOT_EQUALS = "not-equals"
}

export class MQTTIFElement extends HTMLElement {
    public static observedAttributes = [];
    private _reader: Function;

    constructor() {
        super();
    }

    public connectedCallback() {
        let topic = this.getAttribute(ATTRIBUTES.TOPIC);
        MQTTProxy.on(topic, this._update.bind(this));

        const path = this.getAttribute(ATTRIBUTES.PATH) ?? "";
        this._reader = path ? new Function("$", `return $${path}`) : null;

        this._update(MQTTProxy.get(topic));
    }

    protected _update(msg: MQTTMessage) {
        let payloadStr = null;
        try {
            let value = msg?.payload;
            let valueStr = value ? new TextDecoder("utf-8").decode(value) : null;
            payloadStr = this._reader ? this._reader(JSON.parse(valueStr)) : valueStr;
        } catch (e) {
            console.error(e);
        }

        let show: boolean = true;
        if (this.hasAttribute(ATTRIBUTES.EQUALS)) {
            const expectedValue: string = this.getAttribute(ATTRIBUTES.EQUALS);
            show = show && (payloadStr == expectedValue);
        }
        if (this.hasAttribute(ATTRIBUTES.NOT_EQUALS)) {
            const expectedValue: string = this.getAttribute(ATTRIBUTES.NOT_EQUALS);
            show = show && (payloadStr != expectedValue);
        }
        this.style.display = show ? null : "none";
    }
}

customElements.define('mqtt-if', MQTTIFElement);
