CREATE SCHEMA IF NOT EXISTS babysteps;

CREATE TABLE IF NOT EXISTS babysteps.events (
    id BYTEA PRIMARY KEY,
    event_data JSONB NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    auth JSONB
);
