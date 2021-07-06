import { MQTTMessage } from '@mqtttoolbox/commons';
import { MQTTProxy } from '../tools/mqttProxy';

enum ATTRIBUTES {
    TOPIC = "topic",
    EQUALS = "equals",
    NOT_EQUALS = "not-equals"
}

export class MQTTIFElement extends HTMLElement {
    public static observedAttributes = [];

    protected _shadowRoot: ShadowRoot;

    constructor() {
        super();
    }

    public connectedCallback() {
        let topic = this.getAttribute(ATTRIBUTES.TOPIC);
        MQTTProxy.on(topic, this._update.bind(this));

        this._update(MQTTProxy.get(topic));
    }

    protected _update(msg: MQTTMessage) {
        const payloadStr = msg ? new TextDecoder("utf-8").decode(msg.payload) : undefined;

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
