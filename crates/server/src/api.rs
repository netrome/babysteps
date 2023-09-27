pub struct Config<Addr> {
    pub event_store: EventStore,
    pub address: Addr,
    pub static_root: PathBuf,
    pub bundle_root: PathBuf
}

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
        .and(event_store)
        .and(warp::path!("api" / "events"))
        .and(warp::query::<QueryEvents>())
        .and_then(query_events_handler);

    let static_files = warp::path("static").and(warp::fs::dir(conf.static_root));
    let app_files = warp::path("app").and(warp::fs::dir(conf.bundle_root.clone()));
    let app_path = warp::get().and(warp::fs::file(conf.bundle_root.join("index.html")));

    let routes = add_event
        .or(delete_event)
        .or(query_events)
        .or(static_files)
        .or(app_files)
        .or(app_path);

    warp::serve(routes).run(conf.address).await;
}

#[tracing::instrument(skip(event_store))]
async fn add_event_handler(event_store: EventStore, event: Event) -> Result<impl warp::Reply, Infallible> {
    tracing::info!("Adding event");
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

#[derive(serde::Deserialize, Debug)]
struct QueryEvents {
    count: Option<usize>,
}

use std::convert::Infallible;
use std::net::SocketAddr;
use std::path::PathBuf;

use warp::Filter;
use warp::http::StatusCode;

use babysteps_event::Event;

use crate::store::EventStore;
