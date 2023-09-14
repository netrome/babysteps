pub async fn serve(event_store: EventStore, address: ([u8; 4], u16)) {
    let event_store = warp::any().map(move || event_store.clone());

    let add_event = warp::post()
        .and(event_store.clone())
        .and(warp::path!("api" / "event"))
        .and(warp::body::json::<Event>())
        .and_then(add_event_handler);

    let query_events = warp::get()
        .and(event_store)
        .and(warp::path!("api" / "events"))
        .and(warp::query::<QueryEvents>())
        .and_then(query_events_handler);

    let static_files = warp::path("app").and(warp::fs::dir("crates/app/dist"));

    let routes = add_event
        .or(query_events)
        .or(static_files);

    warp::serve(routes).run(address).await;
}

async fn add_event_handler(event_store: EventStore, event: Event) -> Result<impl warp::Reply, Infallible> {
    event_store.add_event(&event).expect("Error adding event");
    Ok(StatusCode::CREATED)
}

async fn query_events_handler(event_store: EventStore, query: QueryEvents) -> Result<impl warp::Reply, Infallible> {
    let events = event_store.get_latest_events(query.count).expect("Error querying events");
    Ok(warp::reply::json(&events))
}

#[derive(serde::Deserialize)]
struct QueryEvents {
    count: usize,
}

use warp::Filter;
use warp::http::StatusCode;
use std::convert::Infallible;

use babysteps_event::Event;

use crate::store::EventStore;
