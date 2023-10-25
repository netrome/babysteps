import { css, html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class ViewBabyStatus extends LitElement {
  static properties = {
    babyStatus: { type: Object, state: true },
  };

  constructor() {
    super();
    this.babyStatus = null;
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
    this.fetchBabyStatus();
  }

  static styles = css`
    img {
      display: block;
      margin: auto;
      width: 250px;
      filter: invert(48%) sepia(65%) saturate(447%) hue-rotate(73deg) brightness(96%) contrast(86%);
    }

    .grid {
      grid-column-gap: 40px;
      grid-row-gap: 20px;
    }
 
    @media (width > 992px) {
      .grid {
        grid-template-columns: 250px 1fr;
        grid-template-rows: 1fr;
      }
    }
  `;

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

  calculateTimeDifference(end, start) {
    const endDate = new Date(end);
    const startDate = new Date(start);
    const differenceInSeconds = (endDate - startDate) / 1000;

    const hours = Math.floor(differenceInSeconds / 3600);
    const minutes = Math.floor((differenceInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  calculateNextNapTime(wakeUpTime) {
    const wakeUpDate = new Date(wakeUpTime);
    const nextNapDate = new Date(wakeUpDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
    return nextNapDate.toLocaleTimeString();
  }

  renderBabyStatus() {
    if (!this.babyStatus) {
      return html`<p>Loading...</p>`;
    }

    const { nap_status: napStatus, last_meal_time: lastMealTime } =
      this.babyStatus;
    const isAwake = "Awake" in napStatus;
    const statusTime = isAwake ? napStatus.Awake : napStatus.Asleep;
    const timeSinceStatusChange = this.calculateTimeDifference(
      new Date(),
      statusTime,
    );
    const timeSinceLastMeal = this.calculateTimeDifference(
      new Date(),
      lastMealTime,
    );
    const nextNapTime = isAwake ? this.calculateNextNapTime(statusTime) : "N/A";

    return html`
      <article class="grid">
        <div>
          <img src="${
      isAwake ? "static/awake-icon.png" : "static/sleep-icon.png"
    }" alt="${isAwake ? "Awake" : "Asleep"}" />
        </div>
        <div>
          <p><b>${isAwake ? "Awake" : "Asleep"} since:</b> ${
      (new Date(statusTime)).toLocaleTimeString()
    } (${timeSinceStatusChange})</p>
          <p><b>Last meal:</b> ${
      (new Date(lastMealTime)).toLocaleTimeString()
    } (${timeSinceLastMeal} ago)</p>
          <p><b>Estimated next nap:</b> ${nextNapTime}</p>
        </div>
      </article>
    `;
  }

  render() {
    return html`
      ${this.renderBabyStatus()}
    `;
  }
}
customElements.define("view-baby-status", ViewBabyStatus);
