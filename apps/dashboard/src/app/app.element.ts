import { Server } from 'http';
import './app.element.scss';

enum ATTRIBUTES {
  TITLE = "title",
  UNIT = "unit",

  SERVER = "server",
  TOPIC = "topic",
  PATH = "path"
}

export class MQTTWidgetElement extends HTMLElement {
  public static observedAttributes = [];

  private _valueElement: HTMLSpanElement;
  private _dateElement: HTMLSpanElement;

  private _reader: Function;

  constructor() {
    super();
    this.innerHTML = `
      <div class="col-md-3">
        <div class="card border-dark">
          <div class="card-body">
            <h5 class="card-title"><span name="title"></span></h5>
            <div class="card-text"><span name="value"></span> <span name="unit"></span></div>
            <p class="card-text text-right"><small name="date" class="text-muted"></small></p>

          </div>
        </div>
      </div>`;

    this._valueElement = this.querySelector(`*[name="value"]`);
    this._dateElement = this.querySelector(`*[name="date"]`);
  }

  public connectedCallback() {
    for (let id of [ATTRIBUTES.TITLE, ATTRIBUTES.UNIT]) {
      let e: HTMLElement = this.querySelector(`*[name="${id}"]`);
      if (e) e.innerHTML = this.getAttribute(id);
    }

    const path = this.getAttribute(ATTRIBUTES.PATH) ?? "";
    this._reader = new Function("$", `return $${path}`);

    this._update();
  }

  private _update() {
    let value = { a: 1, b: 2, c: { d: 3, e: 4 } };
    let valueStr: string = "--";
    try {
      if (value) {
        valueStr = this._reader(value);
      }
    } catch (e) {
      console.error(e);
      valueStr = "!FAILED!"
    }

    this._valueElement.innerHTML = valueStr;
    this._dateElement.innerHTML = new Date().toLocaleString();

    setTimeout(() => {
      this._update();
    }, 1000);
  }
}
customElements.define('mqtt-widget', MQTTWidgetElement);
