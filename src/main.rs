#[tokio::main]
async fn main() {
    let args = Cli::parse();

    babysteps::log::init().expect("Failed to initialize logging");
    tracing::info!("Hello world!");

    let event_store = babysteps::sled_store::Store::new(Some(args.database_dir)).unwrap();
    let api_config = babysteps::api::Config {
        event_store,
        address: ([127, 0, 0, 1], args.port),
        static_root: args.static_root,
        bundle_root: args.bundle_root,
    };

    babysteps::api::serve(api_config).await;
}


#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Directory to persist the application state
    #[arg(short, long, env="BS_DATABASE_DIR")]
    database_dir: PathBuf,

    /// Root to serve static files
    #[arg(short, long, env="BS_STATIC_ROOT")]
    static_root: PathBuf,

    /// Root to serve application bundle
    #[arg(short, long, env="BS_BUNDLE_ROOT")]
    bundle_root: PathBuf,

    /// Port to serve on
    #[arg(short, long, env="BS_PORT")]
    port: u16,
}

use std::path::PathBuf;

use clap::Parser;
