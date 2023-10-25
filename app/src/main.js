import "router-slot";

import { ViewBabyStatus } from "./view_baby_status";
import { ViewEvents } from "./view_events";
import { CreateEvent } from "./create_event";

import { addStylesheetsToRoot } from "./style";

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
      path: "status",
      component: ViewBabyStatus,
    },
    {
      path: "**",
      redirectTo: "events",
    },
  ]);
});

addStylesheetsToRoot();
