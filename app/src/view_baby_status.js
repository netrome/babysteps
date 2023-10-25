import { html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class ViewBabyStatus extends LitElement {
  static properties = {
    babyStatus: { type: Object, state: true },
  }

  constructor() {
    super();
    this.babyStatus = null;
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
    this.fetchBabyStatus();
  }

  async fetchBabyStatus() {
    try {
      const response = await fetch("/api/baby_status");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.babyStatus = await response.json();

    } catch (error) {
      this.error = error.message;
    }
  }

  render() {
    return html`
      <article>
        <p>Yo</p>
        <p>${JSON.stringify(this.babyStatus)}</p>
      </article>
    `;
  }
}

customElements.define('view-baby-status', ViewBabyStatus);
