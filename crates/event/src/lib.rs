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
