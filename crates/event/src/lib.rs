#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Event {
    pub event_type: EventType,
    #[serde(with = "time::serde::iso8601")]
    pub event_time: time::OffsetDateTime,
    #[serde(with = "time::serde::iso8601")]
    pub created_at: time::OffsetDateTime,
    // Additional fields, such as signature, can be added here.
    pub auth: Option<Auth>,
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
    pub quantity: Option<f64>, // Quantity in milliliters or grams.
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Auth {
    /// Secp256k1 X-only public key
    verifying_key: [u8; 32],

    /// BIP-340 Schnorr signature
    #[serde(with = "serde_big_array::BigArray")]
    signature: [u8; 64],
}

impl Event {
    pub fn id(&self) -> [u8; 32] {
        let mut event_data = self.event_type.as_byte_vec();

        for timestamp in [self.event_time, self.created_at] {
            event_data.extend(
                timestamp
                    .format(&Iso8601::DEFAULT)
                    // When can this panic? 🤔
                    .unwrap()
                    .as_bytes(),
            );
        }

        sha2::Sha256::digest(&event_data).into()
    }

    pub fn id_hex(&self) -> String {
        array_bytes::bytes2hex("", self.id())
    }

    pub fn authenticate(&self) -> bool {
        let Some(auth) = &self.auth else {
            return false
        };

        let Ok(verifying_key) = VerifyingKey::from_bytes(&auth.verifying_key) else {
            return false
        };

        let Ok(signature): Result<Signature, _> = auth.signature.as_ref().try_into() else {
            return false
        };

        verifying_key.verify(&self.id(), &signature).is_ok()
    }

    pub fn sign(&mut self, signing_key: &SigningKey) {
        let verifying_key = signing_key.verifying_key().to_bytes().try_into().unwrap();
        let signature = signing_key.sign(&self.id()).to_bytes();

        self.auth = Some(Auth {
            verifying_key,
            signature,
        })
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

use k256::schnorr::{signature::Signer, signature::Verifier, Signature, SigningKey, VerifyingKey};
use sha2::Digest;
use time::format_description::well_known::Iso8601;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_meal_event_id() {
        let meal_event = Event {
            event_type: EventType::Meal(Meal {
                quantity: Some(100.0),
                food_type: FoodType::BreastMilk,
            }),
            event_time: time::OffsetDateTime::parse("2023-10-21T14:30:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            created_at: time::OffsetDateTime::parse("2023-11-21T14:30:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            auth: None,
        };

        let id_hex = array_bytes::bytes2hex("", &meal_event.id());
        assert_eq!(
            id_hex,
            "cdd35c508edd2fb2c4fa2c3548439d8ff0799937ab9b44370411a21cc95a2119"
        );
    }

    #[test]
    fn test_nap_start_event_id() {
        let nap_start_event = Event {
            event_type: EventType::NapStart(NapStart {
                location: Some(NapLocation::InBed),
            }),
            event_time: time::OffsetDateTime::parse("2023-10-21T15:00:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            created_at: time::OffsetDateTime::parse("2023-11-21T15:05:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            auth: None,
        };

        let id_hex = array_bytes::bytes2hex("", &nap_start_event.id());
        assert_eq!(
            id_hex,
            "b9a806a86a711285693def17cb34239c9bd767bde1dd04d37f381c2f5da78bb6"
        );
    }

    #[test]
    fn test_nap_end_event_id() {
        let nap_end_event = Event {
            event_type: EventType::NapEnd(NapEnd {
                location: Some(NapLocation::InBabyCarrier),
            }),
            event_time: time::OffsetDateTime::parse("2023-10-21T16:00:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            created_at: time::OffsetDateTime::parse("2023-11-21T16:05:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            auth: None,
        };

        let id_hex = array_bytes::bytes2hex("", &nap_end_event.id());
        assert_eq!(
            id_hex,
            "f0aad6d17b417c0d3fe19cbbfdff6341763823c499159f2350d3ca77dc81e0ca"
        );
    }

    #[test]
    fn test_other_event_id() {
        let other_event = Event {
            event_type: EventType::Other("Just a note".to_string()),
            event_time: time::OffsetDateTime::parse("2023-10-21T17:00:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            created_at: time::OffsetDateTime::parse("2023-11-21T17:05:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            auth: None,
        };

        let id_hex = array_bytes::bytes2hex("", &other_event.id());
        assert_eq!(
            id_hex,
            "1894c406084d633830e6132628b463c38c934e88e992adfc619c275f4e749bc3"
        );
    }

    #[test]
    fn test_sign_event() {
        let signing_key_hex = "cdd35c508edd2fb2c4fa2c3548439d8ff0799937ab9b44370411a21cc95a2119";
        let signing_key =
            SigningKey::from_bytes(&array_bytes::hex2bytes(signing_key_hex).unwrap()).unwrap();

        let mut meal_event = Event {
            event_type: EventType::Meal(Meal {
                quantity: Some(100.0001),
                food_type: FoodType::BreastMilk,
            }),
            event_time: time::OffsetDateTime::parse("2023-10-21T14:30:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            created_at: time::OffsetDateTime::parse("2023-11-21T14:30:00Z", &Iso8601::DEFAULT)
                .unwrap(),
            auth: None,
        };

        // No auth field should not authenticate
        assert!(!meal_event.authenticate());

        meal_event.sign(&signing_key);

        // Authentication should succeed with proper signature
        assert!(meal_event.authenticate());

        // Tamper with signature
        meal_event.auth.as_mut().unwrap().signature[0] += 1;

        // Authentication should now fail
        assert!(!meal_event.authenticate());
    }
}
