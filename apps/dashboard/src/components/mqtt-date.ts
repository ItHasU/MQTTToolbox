import { MQTTMessage } from '@mqtttoolbox/commons';
import { MQTTProxy } from '../tools/mqttProxy';

enum ATTRIBUTES {
    TOPIC = "topic",
    FORMAT = "format"
}

export class MQTTDateElement extends HTMLElement {
    public static observedAttributes = [];

    protected _shadowRoot: ShadowRoot;

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
    }

    public connectedCallback() {
        let topic = this.getAttribute(ATTRIBUTES.TOPIC);
        MQTTProxy.on(topic, this._update.bind(this));

        this._update(MQTTProxy.get(topic));
    }

    protected _update(msg: MQTTMessage) {
        if (!msg) {
            this._shadowRoot.innerHTML = "--";
            return;
        }

        try {
            const format = this.getAttribute(ATTRIBUTES.FORMAT) ?? undefined;
            const valueStr = new Date(msg.timestamp).toLocaleString(format);
            this._shadowRoot.innerHTML = valueStr;
        } catch (e) {
            console.error(e);
            this._shadowRoot.innerHTML = "xx";
        }
    }
}

customElements.define('mqtt-date', MQTTDateElement);
