pub struct Store {
    pool: sqlx::PgPool,
}

impl Store {
    pub async fn new(database_url: &str) -> anyhow::Result<Self> {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .connect(database_url)
            .await?;

        Ok(Self { pool })
    }

    async fn add_event(&self, event: &Event) -> anyhow::Result<()> {
        tracing::info!("Adding event");

        let event_data = serde_json::to_value(event)?;

        sqlx::query!(
            r#"
            INSERT INTO babysteps.events (id, event_data, event_time, created_at, auth)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            &event.id(),
            event_data,
            event.event_time,
            event.created_at,
            event.auth.as_ref().map(serde_json::to_value).transpose()?,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn remove_event(&self, event: &Event) -> anyhow::Result<()> {
        tracing::info!("Removing event");

        // Remove the event from the database
        sqlx::query!(
            r#"
            DELETE FROM babysteps.events WHERE id = $1
            "#,
            &event.id(),
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn get_latest_events(&self, n: usize) -> anyhow::Result<VecDeque<Event>> {
        tracing::info!("Getting latest events");

        let events = sqlx::query!(
            r#"
            SELECT event_data FROM babysteps.events ORDER BY created_at DESC LIMIT $1
            "#,
            n as i64 // PostgreSQL expects i64 for the LIMIT clause
        )
        .fetch_all(&self.pool)
        .await?
        .into_iter()
        .map(|record| serde_json::from_value(record.event_data))
        .collect::<Result<VecDeque<_>, _>>()?;

        Ok(events)
    }
}

#[async_trait::async_trait]
impl EventStore for Store {
    async fn add_event(&self, event: &Event) -> anyhow::Result<()> {
        self.add_event(event).await
    }

    async fn remove_event(&self, event: &Event) -> anyhow::Result<()> {
        self.remove_event(event).await
    }

    async fn get_latest_events(&self, n: usize) -> anyhow::Result<VecDeque<Event>> {
        self.get_latest_events(n).await
    }
}
use std::collections::VecDeque;

use crate::{event::Event, store::EventStore};
