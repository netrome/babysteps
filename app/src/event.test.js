import test from "ava";
import { computeEventId } from "./event.js";
import { schnorr } from "@noble/curves/secp256k1";

test("computeEventId should correctly compute the event ID", (t) => {
  const event = {
    event_time: "2023-10-21T14:30:00Z",
    created_at: "2023-11-21T14:30:00Z",
    event_type: {
      Meal: {
        quantity: 100.001,
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

test("signing and verifying an event with BIP-340 Schnorr signatures using noble-curves", async (t) => {
  const event = {
    event_time: "2023-10-21T14:30:00Z",
    created_at: "2023-11-21T14:30:00Z",
    event_type: {
      Meal: {
        quantity: 100.001,
        food_type: "BreastMilk",
      },
    },
  };

  const computedId = computeEventId(event);

  // Generate a random private key and corresponding public key
  const privateKey = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
  const publicKey = schnorr.getPublicKey(privateKey);

  // Sign the event ID with the private key using BIP-340 Schnorr signature
  const signature = schnorr.sign(computedId, privateKey);

  // Verify the BIP-340 Schnorr signature with the public key
  const isValid = schnorr.verify(signature, computedId, publicKey);

  // Check if the signature is valid
  t.true(isValid, "The Schnorr signature should be valid");
});

function toHexString(byteArray) {
  return Array.from(
    byteArray,
    (byte) => ("0" + (byte & 0xFF).toString(16)).slice(-2),
  ).join("");
}
