import { MQTTMessage } from '@mqtttoolbox/commons';
import { MQTTProxy } from '../tools/mqttProxy';

enum ATTRIBUTES {
    TOPIC = "topic",
    UNIT = "unit"
}

export class MQTTAgeElement extends HTMLElement {
    public static observedAttributes = [];

    protected _shadowRoot: ShadowRoot;
    protected _nextTimeoutHandle: number = null;

    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'closed' });
    }

    public connectedCallback() {
        // Clean previous update process
        this._cancelUpdate();
        // Start a new update process
        this._update();
    }

    public disconnectedCallback() {
        this._cancelUpdate();
    }

    protected _cancelUpdate() {
        if (this._nextTimeoutHandle) {
            clearTimeout(this._nextTimeoutHandle);
            this._nextTimeoutHandle = null;
        }
    }

    protected _update() {
        if (!this._shadowRoot) {
            // Do nothing, component may have been deleted from DOM
            return;
        }

        const topic: string = this.getAttribute(ATTRIBUTES.TOPIC);
        const msg: MQTTMessage = MQTTProxy.get(topic);

        try {
            if (!msg) {
                this._shadowRoot.innerHTML = "--";
            } else {

                const duration_ms: number = new Date().getTime() - msg.timestamp;
                let valueStr: string = `${duration_ms} ms`;

                let unit: DurationUnit = <DurationUnit>this.getAttribute(ATTRIBUTES.UNIT) ?? null;
                if (unit) {
                    valueStr = `${getDurationMS2Unit(duration_ms, unit)} ${unit}`;
                } else {
                    for (let autoUnit of ["ms", "s", "m", "h", "d"]) {
                        let tmp: number = getDurationMS2Unit(duration_ms, <DurationUnit>autoUnit);
                        if (unit && tmp == 0) {
                            // Unit is too large to display duration, keep previous unit
                            // If we do not have one yet, initialize with first unit
                            break;
                        }
                        unit = <DurationUnit>autoUnit;
                        valueStr = `${getDurationMS2Unit(duration_ms, <DurationUnit>unit)} ${unit}`;
                    }
                }

                this._shadowRoot.innerHTML = valueStr;
            }
        } catch (e) {
            console.error(e);
            this._shadowRoot.innerHTML = "xx";
        } finally {
            // Schedule next update in one second
            this._nextTimeoutHandle = <any>setTimeout(() => {
                this._update();
            }, 1000);
        }
    }
}

type DurationUnit = "ms" | "s" | "m" | "h" | "d";

function getDurationMS2Unit(duration_ms: number, unit: DurationUnit): number {
    return Math.floor(duration_ms / getFactorForUnitToMS(unit));
}

function getFactorForUnitToMS(unit: DurationUnit): number {
    switch (unit) {
        case "ms":
            return 1;
        case "s":
            return 1000;
        case "m":
            return 1000 * 60;
        case "h":
            return 1000 * 60 * 60;
        case "d":
            return 1000 * 60 * 60 * 24;
        default:
            throw new Error(`Invalid unit '${unit}'`);
    }
}

customElements.define('mqtt-age', MQTTAgeElement);
