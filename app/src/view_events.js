import { html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class ViewEvents extends LitElement {
  static properties = {
    events_per_day: { type: Object, state: true },
    error: { type: String },
  };

  constructor() {
    super();
    this.eventsPerDay = {};
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
    this.fetchEvents();
  }

  async fetchEvents() {
    try {
      const response = await fetch("/api/events?count=10000");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      var events = await response.json();

      events.sort((a, b) => {
        const dateA = new Date(a.event_time);
        const dateB = new Date(b.event_time);
        return dateB - dateA;
      });

      var eventsPerDay = {};
      events.forEach((e) => {
        const eventDay = new Date(e.event_time).toLocaleDateString();
        var dayEvents = eventsPerDay[eventDay] ?? [];
        dayEvents.push(e);
        eventsPerDay[eventDay] = dayEvents;
      });

      this.eventsPerDay = eventsPerDay;
      this.requestUpdate();
    } catch (error) {
      this.error = error.message;
    }
  }

  eventsTableHeader() {
    return html`
      <thead>
        <tr>
          <th scope="col">Event time</th>
          <th scope="col">Event type</th>
          <th scope="col">Event details</th>
        </tr>
      </thead>
    `;
  }

  eventsTableBody(events) {
    return html`
      <tbody>
        ${events.map(this.eventRow.bind(this))}
      </tbody>
    `;
  }

  eventRow(event) {
    let event_time_date = new Date(event.event_time);
    let time_string = event_time_date.toLocaleTimeString();
    let event_type = Object.keys(event.event_type)[0];
    let event_details = this.eventDetails(event);
    return html`
      <tr>
        <td>${time_string}</td>
        <td>${event_type}</td>
        <td>${event_details}</td>
      </tr>
    `;
  }

  eventDetails(event) {
    let event_type = Object.keys(event.event_type)[0];

    return {
      ["NapStart"]: this.napDetails,
      ["NapEnd"]: this.napDetails,
      ["Meal"]: this.mealDetails,
    }[event_type](event.event_type[event_type]);
  }

  mealDetails(meal) {
    const quantityStr = meal.quantity ? ", quantity: " + meal.quantity : "";
    const otherFoodType = meal.food_type?.Other;
    const foodType = otherFoodType
      ? otherFoodType + " (other)"
      : meal.food_type;
    return "Type: " + foodType + quantityStr;
  }

  napDetails(nap) {
    const otherLocation = nap.location?.Other;
    const location = otherLocation ?? nap.location;

    return "Location: " + location;
  }

  eventsTable(events) {
    return html`
      <figure>
        <table role="grid">
          ${this.eventsTableHeader()}
          ${this.eventsTableBody(events)}
        </table>
      </figure>
    `;
  }

  dayEventsTable(day, events) {
    return html`
      <h2>${day}</h2>
      ${this.eventsTable(events)}
    `;
  }

  render() {
    const eventsTables = Object.keys(this.eventsPerDay).map(
      (day) => this.dayEventsTable(day, this.eventsPerDay[day]),
    );
    return html`
      <article>
        ${eventsTables}
      </article>
    `;
  }
}

// Register the custom element
customElements.define("bs-view-events", ViewEvents);
