import { css, html, LitElement } from "lit";
import { choose } from "lit/directives/choose.js";
import "./nap.js";
import "./meal.js";
import { addStylesheetsToElement } from "./style.js";
import { KeyStore } from "./key_store.js";
import { computeEventIdHex, signEvent } from "./event.js";

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
    this.keyStore = new KeyStore('privateKey');
  }

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
        <input type="datetime-local" .value=${
      toDatetimeLocal(this.eventTime)
    } @input=${this.eventTimeChanged}/>
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

    const apiUrl = "/api/event/add";

    let bs_event = {
      event_time: this.eventTime.toISOString(),
      created_at: new Date().toISOString(),
      ...event.detail,
    };

    // Adds auth field to bs_event
    signEvent(bs_event, this.keyStore.getOrCreateKey());

    console.log("Event ID ", computeEventIdHex(bs_event));
    console.log("Submitting event ", bs_event);

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

function toDatetimeLocal(date) {
  let yyyy = date.getFullYear().toString();
  let MM = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
  let dd = date.getDate().toString().padStart(2, "0");
  let hh = date.getHours().toString().padStart(2, "0");
  let mm = date.getMinutes().toString().padStart(2, "0");

  return yyyy + "-" + MM + "-" + dd + "T" + hh + ":" + mm;
}

customElements.define("create-event", CreateEvent);
