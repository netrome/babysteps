import { css, html, LitElement } from "lit";

export class NapStartEventForm extends LitElement {
  constructor() {
    super();
    this.location = "InBed";
    this.otherLocation = "";
  }

  static styles = css`
    /* Add any styles you want here */
  `;

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <label>
          Location: 
          <select .value=${this.location} @change=${this.locationChanged}>
            <option value="InBed">In Bed</option>
            <option value="InBabyCarrier">In Baby Carrier</option>
            <option value="Other">Other</option>
          </select>
          ${
      this.location === "Other"
        ? html`
                <input 
                  type="text" 
                  .value=${this.otherLocation} 
                  @input=${(e) => (this.otherLocation = e.target.value)} 
                  placeholder="Specify other location"
                />
              `
        : ""
    }
        </label>
        <button type="submit">Create NapStart Event</button>
      </form>
    `;
  }

  locationChanged(event) {
    this.location = event.target.value;
  }

  handleSubmit(event) {
    event.preventDefault();

    const locationDetail = this.location === "Other"
      ? { Other: this.otherLocation }
      : this.location;

    // Form the object structure for NapStart event and emit a custom event with the detail
    const eventDetail = {
      event_type: {
        "NapStart": { location: locationDetail },
      },
    };

    this.dispatchEvent(
      new CustomEvent("napstart-event-created", { detail: eventDetail }),
    );
  }
}

customElements.define("nap-start-event-form", NapStartEventForm);
