import { css, html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class ViewEvents extends LitElement {
  static properties = {
    events: { type: Array },
    error: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .error {
      color: red;
    }
  `;

  constructor() {
    super();
    this.events = [];
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
    this.fetchEvents();
  }

  async fetchEvents() {
    try {
      const response = await fetch("/api/events"); // Adjust the URL accordingly
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.events = await response.json();
    } catch (error) {
      this.error = error.message;
    }
  }

  render() {
    return html`
      <h1>All events</h1>
      ${this.error ? html`<div class="error">${this.error}</div>` : ""}
      <ul>
        ${
      this.events.map(
        (event) => html`<li>${JSON.stringify(event)}</li>`,
      )
    }
      </ul>
    `;
  }
}

// Register the custom element
customElements.define("bs-view-events", ViewEvents);
