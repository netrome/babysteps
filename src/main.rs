#[tokio::main]
async fn main() {
    babysteps::log::init().expect("Failed to initialize logging");
    tracing::info!("Hello world!");

    let store = babysteps::store::EventStore::new(None).unwrap();
    babysteps::api::serve(store, ([127, 0, 0, 1], 3030)).await;
}

