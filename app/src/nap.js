import { css, html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class NapEventForm extends LitElement {
  static properties = {
    phase: { type: String }, // "start" or "end"
    _location: { type: String, state: true },
    _otherLocation: { type: String, state: true },
  };

  constructor() {
    super();
    this._location = "InBed";
    this._otherLocation = "";
    this.phase = "";
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
  }

  static styles = css`
  `;

  locationSelectHtml() {
    return html`
        <select .value=${this._location} @change=${this.locationChanged}>
          <option value="InBed">In Bed</option>
          <option value="InBabyCarrier">In Baby Carrier</option>
          <option value="Other">Other</option>
        </select>
    `;
  }

  optionalOtherLocationTextInput() {
    return this._location === "Other"
      ? html`<input 
              type="text" 
              .value=${this._otherLocation} 
              @input=${(e) => (this._otherLocation = e.target.value)} 
              placeholder="Specify other location"
            />`
      : "";
  }

  locationHtml() {
    return html`
        <label>
          Location: 
          <div class="grid">
            ${this.locationSelectHtml()}
            ${this.optionalOtherLocationTextInput()}
          </div>
        </label>
    `;
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        ${this.locationHtml()}
        <button type="submit">Create ${this.eventName()} Event</button>
      </form>
    `;
  }

  eventName() {
    const phase = this.phase;
    return "Nap" + phase[0].toUpperCase() + phase.slice(1);
  }

  locationChanged(event) {
    this._location = event.target.value;
  }

  handleSubmit(event) {
    event.preventDefault();

    const eventName = this.eventName();

    const locationDetail = this._location === "Other"
      ? { Other: this._otherLocation }
      : this._location;

    const eventDetail = {
      event_type: {
        [eventName]: { location: locationDetail },
      },
    };

    this.dispatchEvent(
      new CustomEvent("nap-event-created", { detail: eventDetail }),
    );
  }
}

customElements.define("nap-event-form", NapEventForm);
