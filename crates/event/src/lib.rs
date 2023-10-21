#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Event {
    pub event_type: EventType,
    #[serde(with = "time::serde::iso8601")]
    pub event_time: time::OffsetDateTime,
    #[serde(with = "time::serde::iso8601")]
    pub created_at: time::OffsetDateTime,
    // Additional fields, such as signature, can be added here.
}

// Enum to represent the different event types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum EventType {
    Meal(Meal),
    NapStart(NapStart),
    NapEnd(NapEnd),
    Other(String), // A description of the event
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Meal {
    pub quantity: Option<f32>, // Quantity in milliliters or grams.
    pub food_type: FoodType,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum FoodType {
    BreastMilk,
    Formula,
    Other(String),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NapStart {
    pub location: Option<NapLocation>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NapEnd {
    pub location: Option<NapLocation>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum NapLocation {
    InBed,
    InBabyCarrier,
    Other(String),
}

impl Event {
    pub fn id(&self) -> [u8; 32] {
        let mut event_data = self.event_type.as_byte_vec();

        for timestamp in [self.event_time, self.created_at] {
            event_data.extend(
                timestamp
                    .format(&time::format_description::well_known::Iso8601::DEFAULT)
                    // When can this panic? 🤔
                    .unwrap()
                    .as_bytes(),
            );
        }

        sha2::Sha256::digest(&event_data).into()
    }
}

impl EventType {
    fn as_byte_vec(&self) -> Vec<u8> {
        let mut writer = Vec::new();

        // Should probably never fail unless we're out of memory or something really bad has happened
        ciborium::into_writer(&self, &mut writer).unwrap();

        writer
    }
}

use sha2::Digest;

#[cfg(test)]
mod tests {}
