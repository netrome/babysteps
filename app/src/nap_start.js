import { css, html, LitElement } from "lit";

export class NapStartEventForm extends LitElement {
  constructor() {
    super();
    this.location = "InBed";
    this.otherLocation = "";
    this.eventTime = new Date();
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
        <label>
          Event Time:
          <input type="datetime-local" .value=${this.eventTime} @input=${this.eventTimeChanged}/>
        </label>
        <button type="submit">Create NapStart Event</button>
      </form>
    `;
  }

  eventTimeChanged(event) {
    this.eventTime = new Date(event.target.value);
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
      event_time: this.eventTime.toISOString(),
      created_at: new Date().toISOString(),
    };

    this.dispatchEvent(
      new CustomEvent("napstart-event-created", { detail: eventDetail }),
    );
  }
}

customElements.define("nap-start-event-form", NapStartEventForm);
