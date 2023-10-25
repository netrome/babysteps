pub async fn serve(conf: Config<impl Into<SocketAddr>>) {
    let event_store = warp::any().map(move || conf.event_store.clone());

    let add_event = warp::post()
        .and(event_store.clone())
        .and(warp::path!("api" / "event" / "add"))
        .and(warp::body::json::<Event>())
        .and_then(add_event_handler);

    let delete_event = warp::post()
        .and(event_store.clone())
        .and(warp::path!("api" / "event" / "delete"))
        .and(warp::body::json::<Event>())
        .and_then(delete_event_handler);

    let query_events = warp::get()
        .and(event_store.clone())
        .and(warp::path!("api" / "events"))
        .and(warp::query::<QueryEvents>())
        .and_then(query_events_handler);

    let query_baby_status = warp::get()
        .and(event_store)
        .and(warp::path!("api" / "baby_status"))
        .and_then(query_baby_info_handler);

    let static_files = warp::path("static").and(warp::fs::dir(conf.static_root));
    let app_files = warp::path("app").and(warp::fs::dir(conf.bundle_root.clone()));
    let app_path = warp::get().and(warp::fs::file(conf.bundle_root.join("index.html")));

    let routes = add_event
        .or(delete_event)
        .or(query_events)
        .or(query_baby_status)
        .or(static_files)
        .or(app_files)
        .or(app_path);

    warp::serve(routes).run(conf.address).await;
}

pub struct Config<Addr> {
    pub event_store: EventStore,
    pub address: Addr,
    pub static_root: PathBuf,
    pub bundle_root: PathBuf
}

#[tracing::instrument(skip(event_store))]
async fn add_event_handler(event_store: EventStore, event: Event) -> Result<impl warp::Reply, Infallible> {
    tracing::info!("Adding event. Id: {}, auth: {}", event.id_hex(), event.authenticate());
    event_store.add_event(&event).expect("Error adding event");
    Ok(StatusCode::CREATED)
}

#[tracing::instrument(skip(event_store))]
async fn delete_event_handler(event_store: EventStore, event: Event) -> Result<impl warp::Reply, Infallible> {
    tracing::info!("Deleting event");
    event_store.remove_event(&event).expect("Error removing event");
    Ok(StatusCode::CREATED)
}

#[tracing::instrument(skip(event_store))]
async fn query_events_handler(event_store: EventStore, query: QueryEvents) -> Result<impl warp::Reply, Infallible> {
    let count = query.count.unwrap_or(100);
    let events = event_store.get_latest_events(count).expect("Error querying events");
    tracing::debug!("Returning events: {:?}", events.len());
    Ok(warp::reply::json(&events))
}

#[tracing::instrument(skip(event_store))]
async fn query_baby_info_handler(event_store: EventStore) -> Result<impl warp::Reply, Infallible> {
    let mut events: Vec<_> = event_store.get_latest_events(BABY_INFO_HORIZON).expect("Error querying events").into_iter().collect();
    events.sort_by_key(|event| event.event_time);

    // Assume one of the last few events is a nap, OR DIE!
    let nap_status = events.iter().find_map(NapStatus::from_event).unwrap();

    // Same. This is some dangerous stuff!
    let last_meal_time = events.iter().find(|event| event.is_meal()).unwrap().event_time; 

    let baby_info = BabyInfo {
        nap_status,
        last_meal_time,
    };

    tracing::debug!("Returning baby info: {:?}", baby_info);
    Ok(warp::reply::json(&baby_info))
}

#[derive(Debug, serde::Serialize)]
struct BabyInfo {
    nap_status: NapStatus,
    last_meal_time: time::OffsetDateTime,
}

#[derive(Debug, serde::Serialize)]
enum NapStatus {
    Awake{since: time::OffsetDateTime},
    Asleep{since: time::OffsetDateTime},
}

impl NapStatus {
    fn from_event(event: &Event) -> Option<Self> {
        match event.event_type {
            EventType::NapStart(_) => Some(Self::Asleep{since: event.event_time}),
            EventType::NapEnd(_) => Some(Self::Awake{since: event.event_time}),
            _ => None,
        }
    }
}

const BABY_INFO_HORIZON: usize = 100;

#[derive(serde::Deserialize, Debug)]
struct QueryEvents {
    count: Option<usize>,
}

use std::convert::Infallible;
use std::net::SocketAddr;
use std::path::PathBuf;

use warp::Filter;
use warp::http::StatusCode;

use crate::event::Event;
use crate::event::EventType;

use crate::store::EventStore;
