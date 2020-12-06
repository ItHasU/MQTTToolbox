import { MQTTWidgetElement } from './app.element';

describe('MQTTWidgetElement', () => {
  let app: MQTTWidgetElement;

  beforeEach(() => {
    app = new MQTTWidgetElement();
    app.setAttribute("title", "Sensor")
  });

  it('should create successfully', () => {
    expect(app).toBeTruthy();
  });

  it('should have the expected title', () => {
    app.connectedCallback();

    expect(app.querySelector('*[name="title"]').innerHTML).toEqual('Sensor');
  });
});
