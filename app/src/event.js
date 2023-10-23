import cbor from "cbor";
import crypto from "crypto";
import { schnorr } from "@noble/curves/secp256k1";

/**
 * Computes the event ID for a given event.
 *
 * The event ID is computed as follows:
 * 1. CBOR encode the event type.
 * 2. Convert the event time and created time to ISO 8601 format with nanosecond precision.
 * 3. Encode the event time and created time as UTF-8 strings.
 * 4. Concatenate the CBOR-encoded event type, UTF-8 encoded event time, and UTF-8 encoded created time.
 * 5. Compute the SHA-256 hash of the concatenated bytes.
 *
 * @param {Object} event - The event to compute the ID for.
 * @param {Object} event.event_type - The type of the event.
 * @param {string} event.event_time - The time the event occurred, as a string.
 * @param {string} event.created_at - The time the event was created, as a string.
 * @returns {Uint8Array} - The computed event ID, as a 32-byte Uint8Array.
 */
export function computeEventId(event) {
  // Convert event type to bytes
  const eventTypeBytes = new Uint8Array(cbor.encode(event.event_type));

  // Ensure timestamps are in ISO 8601 format
  const eventTimeIso = new Date(event.event_time).toISOString();
  const createdAtIso = new Date(event.created_at).toISOString();

  const eventTimePadded = eventTimeIso.replace(/(\.\d{3})Z$/, "$1000000Z");
  const createdAtPadded = createdAtIso.replace(/(\.\d{3})Z$/, "$1000000Z");

  const eventTimeBytes = new TextEncoder().encode(eventTimePadded);
  const createdAtBytes = new TextEncoder().encode(createdAtPadded);

  // Concatenate all byte arrays
  const allBytes = new Uint8Array(
    eventTypeBytes.length + eventTimeBytes.length + createdAtBytes.length,
  );
  allBytes.set(eventTypeBytes, 0);
  allBytes.set(eventTimeBytes, eventTypeBytes.length);
  allBytes.set(createdAtBytes, eventTypeBytes.length + eventTimeBytes.length);

  // Compute SHA-256 hash
  const hashBuffer = crypto.createHash("sha256").update(allBytes).digest();

  return hashBuffer;
}

export function computeEventIdHex(event) {
  return toHexString(computeEventId(event))
}

/**
 * Signs the given event ID using the provided private key.
 *
 * @param {Uint8Array} eventId - The event ID to be signed.
 * @param {Uint8Array} privateKey - The private key as a Uint8Array.
 * @returns {Uint8Array} - The signature as a Uint8Array.
 */
export function signEventId(eventId, privateKey) {
  // Ensure the private key is a Uint8Array
  if (!(privateKey instanceof Uint8Array)) {
    throw new TypeError("Private key must be a Uint8Array");
  }

  // Sign the event ID using the BIP-340 Schnorr signature
  const signature = schnorr.sign(eventId, privateKey);

  // Return the signature as a Uint8Array
  return signature;
}

/**
 * Signs the given event, adding the auth field with the signature and verifying key.
 *
 * @param {Object} event - The event to sign.
 * @param {Uint8Array} privateKey - The private key to sign the event with.
 */
export function signEvent(event, privateKey) {
  // Compute the event ID
  const eventId = computeEventId(event);

  // Sign the event ID
  const signature = signEventId(eventId, privateKey);

  // Compute the verifying key (public key)
  const verifyingKey = schnorr.getPublicKey(privateKey);

  // Add the auth field to the event
  event.auth = {
    verifying_key: Array.from(verifyingKey),
    signature: Array.from(signature),
  };
}

function toHexString(byteArray) {
  return Array.from(
    byteArray,
    (byte) => ("0" + (byte & 0xFF).toString(16)).slice(-2),
  ).join("");
}
