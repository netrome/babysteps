#[tokio::main]
async fn main() {
    let store = babysteps::store::EventStore::new(None).unwrap();
    babysteps::api::serve(store, ([127, 0, 0, 1], 3030)).await;
}

