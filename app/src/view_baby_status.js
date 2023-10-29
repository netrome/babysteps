import { css, html, LitElement, nothing } from "lit";
import { addStylesheetsToElement } from "./style";

export class ViewBabyStatus extends LitElement {
  static properties = {
    babyStatus: { type: Object, state: true },
    babyAnimation: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.babyStatus = null;
    this.babyAnimation = true;
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
      height: 8rem;
      width: 8rem;
      filter: invert(48%) sepia(65%) saturate(447%) hue-rotate(73deg) brightness(96%) contrast(86%);
    }

    .bounce {
      position: relative;
      bottom: 0rem;
      left: 0rem;
      height: 8rem;
      animation: bounce 0.23s, rotate 0.51s;
      animation-timing-function: cubic-beizer(0.3, 0.8, 0.75, 1), ease-in-out;
      animation-direction: alternate, alternate;
      animation-iteration-count: 4, 2;
    }

    @keyframes bounce {
      to {
        height: 9rem;
        width: 9rem;
        bottom: 2rem;
      }
    }

    @keyframes rotate {
      to {
        transform: rotate(30deg);
      }
    }

    .tilt {
      position: relative;
      bottom: 0rem;
      left: 0rem;
      animation: tilt 2s;
      animation-timing-function: linear;
    }

    @keyframes tilt {
      30% {
        bottom: 0.3rem;
        left: 0.2rem;
        transform: rotate(15deg);
      }
      70% {
        bottom: -0.3rem;
        left: 0.2rem;
        transform: rotate(-8deg);
      }
      100% {
        transform: rotate(0deg);
      }
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
    const animateClass = this.babyAnimation
      ? (isAwake ? "bounce" : "tilt")
      : nothing;

    return html`
      <article class="grid">
        <div>
          <img src="${
      isAwake ? "static/awake-icon.png" : "static/sleep-icon.png"
    }" alt="${
      isAwake ? "Awake" : "Asleep"
    }" class=${animateClass} @animationend=${(e) => {
      if (e.elapsedTime > 1) this.babyAnimation = false;
    }} @click=${() => {
      this.babyAnimation = true;
    }} />
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
