#[async_trait::async_trait]
pub trait EventStore {
    async fn add_event(&self, event: &Event) -> anyhow::Result<()>;

    async fn remove_event(&self, event: &Event) -> anyhow::Result<()>;

    async fn get_latest_events(&self, n: usize) -> anyhow::Result<VecDeque<Event>>;
}

use std::collections::VecDeque;

use crate::event::Event;
