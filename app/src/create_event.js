import { css, html, LitElement } from "lit";
import "./nap_start.js";

export class CreateEvent extends LitElement {
  static properties = {
    selectedEventType: { type: String },
  };

  constructor() {
    super();
    this.selectedEventType = "";
  }

  static styles = css`
    /* Add any styles you want here */
  `;

  render() {
    return html`
      <label>
        Select Event Type: 
        <select .value=${this.selectedEventType} @change=${this.selectChanged}>
          <option value="">Select an event type</option>
          <option value="NapStart">Nap Start</option>
          <!-- More options will be added here for other event types -->
        </select>
      </label>
      ${
      this.selectedEventType === "NapStart"
        ? html`<nap-start-event-form @napstart-event-created=${this.handleEventCreated}></nap-start-event-form><p>Yo</p>`
        : ""
    }
    `;
  }

  selectChanged(event) {
    this.selectedEventType = event.target.value;
  }

  handleEventCreated(event) {
    console.log("Event Created:", event.detail);

    const apiUrl = "/api/event";

    // Send a POST request to the backend
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event.detail),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return "ok"
      })
      .then((data) => {
        console.log("Event successfully created:", data);
        history.pushState(null, "", "/events");
      })
      .catch((error) => {
        console.error("Error creating event:", error);
      });
  }
}

customElements.define("create-event", CreateEvent);
