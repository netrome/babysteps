import { css, html, LitElement } from "lit";
import "router-slot";

import { ViewEvents } from "./view_events";
import { CreateEvent } from "./create_event";

import { addStylesheetsToElement, addStylesheetsToRoot } from "./style";

customElements.whenDefined("router-slot").then(async () => {
  const routerSlot = document.querySelector("router-slot");
  routerSlot.add([
    {
      path: "events",
      component: ViewEvents,
    },
    {
      path: "new",
      component: CreateEvent,
    },
    {
      path: "greet",
      component: SimpleGreeting,
    },
    {
      path: "**",
      redirectTo: "events",
    },
  ]);
});

export class SimpleGreeting extends LitElement {
  static properties = {
    name: {},
  };
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      color: blue;
    }
  `;

  constructor() {
    super();
    // Declare reactive properties
    this.name = "World";
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
  }
  // Render the UI as a function of component state
  render() {
    return html`
      <p>Hello, ${this.name}!</p>
      `;
  }
}
customElements.define("bs-simple-greeting", SimpleGreeting);

addStylesheetsToRoot();
