import { css, html, LitElement } from "lit";
import { choose } from "lit/directives/choose.js";
import "./nap.js";
import "./meal.js";
import { addStylesheetsToElement } from "./style.js";

export class CreateEvent extends LitElement {
  static properties = {
    selectedEventType: { type: String },
  };

  constructor() {
    super();
    this.selectedEventType = "NapStart";
    this.eventTime = new Date();
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
  }

  static styles = css`
    /* Add any styles you want here */
  `;

  selectButtonsHtml() {
    return html`
      <div class="grid">
        ${this.selectButton("NapStart")}
        ${this.selectButton("NapEnd")}
        ${this.selectButton("Meal")}
      </div>
    `;
  }

  selectButton(option) {
    const buttonClass = this.selectedEventType === option
      ? "secondary outline"
      : "outline";
    return html`<button class=${buttonClass} @click=${
      this.onSelectButtonClick(option)
    }>${option}</button>`;
  }

  onSelectButtonClick(option) {
    return (_e) => {
      this.selectedEventType = option;
    };
  }

  eventTimeHtml() {
    return html`
      <label>
        Event Time:
        <input type="datetime-local" .value=${this.eventTime} @input=${this.eventTimeChanged}/>
      </label>
    `;
  }

  eventSpecificHtml() {
    return choose(this.selectedEventType, [
      [
        "NapStart",
        () =>
          html`<nap-event-form phase="start" @nap-event-created=${this.handleEventCreated}></nap-event-form>`,
      ],
      [
        "NapEnd",
        () =>
          html`<nap-event-form phase="end" @nap-event-created=${this.handleEventCreated}></nap-event-form>`,
      ],
      [
        "Meal",
        () =>
          html`<meal-event-form @meal-event-created=${this.handleEventCreated}></meal-event-form>`,
      ],
    ], () => html`<p>No event selected</p>`);
  }

  render() {
    return html`
      <article>
        ${this.selectButtonsHtml()}
        <div class="grid">
          ${this.eventTimeHtml()}
        </div>
        ${this.eventSpecificHtml()}
      </article>
    `;
  }

  eventTimeChanged(event) {
    this.eventTime = new Date(event.target.value);
  }

  selectChanged(event) {
    this.selectedEventType = event.target.value;
  }

  handleEventCreated(event) {
    console.log("Event Created:", event.detail);

    const apiUrl = "/api/event";

    let bs_event = {
      event_time: this.eventTime.toISOString(),
      created_at: new Date().toISOString(),
      ...event.detail,
    };

    // Send a POST request to the backend
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bs_event),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return "ok";
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
