import test from "ava";
import { computeEventId } from "./event.js";

test("computeEventId should correctly compute the event ID", (t) => {
  const event = {
    event_time: "2023-10-21T14:30:00Z",
    created_at: "2023-11-21T14:30:00Z",
    event_type: {
      Meal: {
        quantity: parseFloat("100.001"),
        food_type: "BreastMilk",
      },
    },
  };

  // Expected ID (this is just a placeholder, replace it with the actual expected ID)
  const expectedIdHex =
    "22820448bdc36d9b33a38d87f0c720b55b94f8332512b3d3102ab0613ce59e8b";

  // Compute the event ID
  const computedId = computeEventId(event);
  const computedIdHex = toHexString(computedId);

  // Check if the computed ID matches the expected ID
  t.is(computedIdHex, expectedIdHex);
});

function toHexString(byteArray) {
  return Array.from(
    byteArray,
    (byte) => ("0" + (byte & 0xFF).toString(16)).slice(-2),
  ).join("");
}
