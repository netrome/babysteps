#[derive(Debug, Clone)]
pub struct EventStore {
    db: sled::Db,
}

impl EventStore {
    pub fn new(path: Option<impl AsRef<Path>>) -> Result<Self, sled::Error> {
        let config = if let Some(p) = path {
            sled::Config::default().path(p)
        } else {
            sled::Config::default().temporary(true)
        };

        let db = config.open()?;

        Ok(Self { db })
    }

    #[tracing::instrument(skip(self))]
    pub fn add_event(&self, event: &Event) -> Result<(), sled::Error> {
        tracing::info!("Adding event");

        let key = event.created_at.to_string();
        let value = serde_json::to_vec(event).unwrap();

        self.db.insert(key, value)?;
        Ok(())
    }

    #[tracing::instrument(skip(self))]
    pub fn remove_event(&self, event: &Event) -> Result<(), sled::Error> {
        tracing::info!("Removing event");

        let key = event.created_at.to_string();

        self.db.remove(key)?;
        Ok(())
    }

    pub fn get_latest_events(&self, n: usize) -> Result<VecDeque<Event>, sled::Error> {
        let mut events = VecDeque::new();

        for result in self.db.iter().rev().take(n) {
            let (_, value) = result?;
            let event: Event = serde_json::from_slice(&value).unwrap();
            events.push_front(event);
        }

        Ok(events)
    }
}

use std::{collections::VecDeque, path::Path};

use babysteps_event::Event;
