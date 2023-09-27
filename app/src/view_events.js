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
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.events = await response.json();
      this.events.reverse();
    } catch (error) {
      this.error = error.message;
    }
  }

  tableHeader() {
    return html`
      <thead>
        <tr>
          <th scope="col">Event date</th>
          <th scope="col">Event time</th>
          <th scope="col">Event type</th>
          <th scope="col">Event details</th>
        </tr>
      </thead>
    `
  }

  tableBody() {
    return html`
      <tbody>
        ${this.events.map(this.eventRow.bind(this))}
      </tbody>
    `
  }

  eventRow(event) {
    let event_time_date = new Date(event.event_time);
    let date_string = event_time_date.toLocaleDateString();
    let time_string = event_time_date.toLocaleTimeString();
    let event_type = Object.keys(event.event_type)[0];
    let event_details = this.eventDetails(event);
    return html`
      <tr>
        <td>${date_string}</td>
        <td>${time_string}</td>
        <td>${event_type}</td>
        <td>${event_details}</td>
      </tr>
    `
  }

  eventDetails(event) {
    let event_type = Object.keys(event.event_type)[0];

    return {
      ["NapStart"]: this.napDetails,
      ["NapEnd"]: this.napDetails,
      ["Meal"]: this.mealDetails,
    }[event_type](event.event_type[event_type])
  }

  mealDetails(meal) {
    const quantityStr = meal.quantity ? ", quantity: " + meal.quantity : "";
    const otherFoodType = meal.food_type?.Other;
    const foodType = otherFoodType ? otherFoodType + " (other)" : meal.food_type;
    return "Type: " + foodType + quantityStr
  }

  napDetails(nap) {
    const otherLocation = nap.location?.Other;
    const location = otherLocation ?? nap.location;
    
    return "Location: " + location
  }

  render() {
    return html`
      <figure>
        <table role="grid">
          ${this.tableHeader()}
          ${this.tableBody()}
        </table>
      </figure>
    `;
  }
}

// Register the custom element
customElements.define("bs-view-events", ViewEvents);
