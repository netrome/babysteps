import cbor from 'cbor';
import crypto from 'crypto';

export function computeEventId(event) {
  // Convert event type to bytes
  const eventTypeBytes = new Uint8Array(cbor.encode(event.event_type));

  // Ensure timestamps are in ISO 8601 format
  const eventTimeIso = new Date(event.event_time).toISOString();
  const createdAtIso = new Date(event.created_at).toISOString();

  const eventTimePadded = eventTimeIso.replace(/(\.\d{3})Z$/, '$1000000Z');
  const createdAtPadded = createdAtIso.replace(/(\.\d{3})Z$/, '$1000000Z');

  const eventTimeBytes = new TextEncoder().encode(eventTimePadded);
  const createdAtBytes = new TextEncoder().encode(createdAtPadded);

  // Concatenate all byte arrays
  const allBytes = new Uint8Array(eventTypeBytes.length + eventTimeBytes.length + createdAtBytes.length);
  allBytes.set(eventTypeBytes, 0);
  allBytes.set(eventTimeBytes, eventTypeBytes.length);
  allBytes.set(createdAtBytes, eventTypeBytes.length + eventTimeBytes.length);

  // Compute SHA-256 hash
  const hashBuffer = crypto.createHash('sha256').update(allBytes).digest();

  return hashBuffer;
}
