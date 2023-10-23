import { css, html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class ViewEvents extends LitElement {
  static properties = {
    eventsPerDay: { type: Object, state: true },
    selectedEvent: { type: Object, state: true },
    toDelete: { type: Object, state: true },
    error: { type: String },
  };

  constructor() {
    super();
    this.eventsPerDay = {};
    this.selectedEvent = {};
    this.toDelete = null;
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
    this.fetchEvents();
  }

  static styles = css`
    .event:hover {
      box-shadow: 0px 0px 5px #757575 inset !important;
    }

    .selected {
      background: var(--primary) !important;
    }

    .delete {
      color: red;
    }
  }
  `;

  // Network IO methods

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
    } catch (error) {
      this.error = error.message;
    }
  }

  handleDeleteEvent(_event) {
    const event = this.toDelete;
    this.toDelete = null;

    console.log("Event Deletion requested:", event);

    const apiUrl = "/api/event/delete";

    // Send a POST request to the backend
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return "ok";
      })
      .then((data) => {
        console.log("Event successfully deleted:", data);
        this.fetchEvents(); // Ideally we should not have to re-fetch but just delete the event from this.eventsPerDay
      })
      .catch((error) => {
        console.error("Error creating event:", error);
        this.error = error.message;
      });
  }

  // State update methods

  eventSelected(event) {
    return (_e) => {
      this.selectedEvent = event;
    };
  }

  promptDelete(event) {
    return (_e) => {
      this.toDelete = event;
    };
  }

  // View methods

  render() {
    const eventsTables = Object.keys(this.eventsPerDay).map(
      (day) => this.dayEventsTable(day, this.eventsPerDay[day]),
    );
    return html`
      <article>
        ${eventsTables}
      </article>
      ${this.deleteEventPrompt()}
    `;
  }

  deleteEventPrompt() {
    const prompt = this.toDelete;
    const open = this.toDelete ? true : false;
    return html`
        <dialog open=${open}>
          <article>
            <h3>Confirm delete</h3>
            <p>Do you really want to delete this event?</p>
            <p>${JSON.stringify(this.toDelete)}</p>
            <footer>
              <p role="button" class="contrast" @click=${
      this.promptDelete(null)
    }>No</p>
              <p role="button" class="primary" @click=${this.handleDeleteEvent}>Yes</p>
            </footer>
          </article>
        </dialog>
      `;
  }

  dayEventsTable(day, events) {
    return html`
      <h2>${day}</h2>
      ${this.eventsTable(events)}
    `;
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

  eventsTableHeader() {
    return html`
      <thead>
        <tr>
          <th scope="col">Event time</th>
          <th scope="col">Event type</th>
          <th scope="col">Event details</th>
          <th scope="col"></th>
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
    const event_time_date = new Date(event.event_time);
    const time_string = event_time_date.toLocaleTimeString();
    const event_type = Object.keys(event.event_type)[0];
    const event_details = this.eventDetails(event);

    const classes = (event == this.selectedEvent) ? "event selected" : "event";
    const deleteButton = (event == this.selectedEvent)
      ? html`<span role="button" class="contrast delete" @click=${
        this.promptDelete(event)
      }>X</span>`
      : "";

    return html`
      <tr class=${classes} @click=${this.eventSelected(event)}>
        <td>${time_string}</td>
        <td>${event_type}</td>
        <td>${event_details}</td>
        <td>${deleteButton}</td>
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

  napDetails(nap) {
    const otherLocation = nap.location?.Other;
    const location = otherLocation ?? nap.location;

    return "Location: " + location;
  }

  mealDetails(meal) {
    const quantityStr = meal.quantity ? ", quantity: " + Math.round(meal.quantity) : "";
    const otherFoodType = meal.food_type?.Other;
    const foodType = otherFoodType
      ? otherFoodType + " (other)"
      : meal.food_type;
    return "Type: " + foodType + quantityStr;
  }
}

// Register the custom element
customElements.define("bs-view-events", ViewEvents);
