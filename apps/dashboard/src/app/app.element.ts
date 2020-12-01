import './app.element.scss';

export class AppElement extends HTMLElement {
  public static observedAttributes = [];

  connectedCallback() {
    const title = 'dashboard';
    this.innerHTML = `
    <div class="col-md-6">
      <div class="card border-dark">
        <div class="card-body">
          <h5 class="card-title">${this.getAttribute("server")}:${this.getAttribute("topic")}</h5>
          <div class="card-text">${null}${this.getAttribute("unit") ?? ""} @ ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
    `;
  }
}
customElements.define('mqtt-widget', AppElement);
