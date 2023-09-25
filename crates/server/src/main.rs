#[tokio::main]
async fn main() {
    babysteps_server::log::init().expect("Failed to initialize logging");
    tracing::info!("Hello world!");

    let store = babysteps_server::store::EventStore::new(Some("events.db")).unwrap();
    babysteps_server::api::serve(store, ([127, 0, 0, 1], 3030)).await;
}

