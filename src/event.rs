#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Event {
    pub timestamp: time::OffsetDateTime,
    pub event_type: EventType,
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
pub enum FoodType {
    BreastMilk,
    Formula,
    TastePortion(String),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Meal {
    pub quantity: Option<f32>, // Quantity in milliliters or grams.
    pub food_type: FoodType,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum NapLocation {
    InBed,
    InBabyCarrier,
    Other(String),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NapStart {
    pub timestamp: time::OffsetDateTime,
    pub location: Option<NapLocation>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NapEnd {
    pub timestamp: time::OffsetDateTime,
}
