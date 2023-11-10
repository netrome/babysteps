#[tokio::main]
async fn main() {
    let args = Cli::parse();

    babysteps::log::init().expect("Failed to initialize logging");
    tracing::info!("Hello world!");

    let ip_addr: IpAddr = args.ip.parse().expect("Failed to parse IP");

    // TODO: Swap event store. Make sure the new store runs migrations on startup :)
    let event_store = event_store(&args).await;
    let api_config = babysteps::api::Config {
        event_store,
        address: (ip_addr, args.port),
        static_root: args.static_root,
        bundle_root: args.bundle_root,
    };

    tokio::select! {
        _ = babysteps::api::serve(api_config) => {}
        _ = tokio::signal::ctrl_c() => {
            println!("Received Ctrl-C signal. Shutting down")
        }
    }
}

#[cfg(feature = "postgres")]
async fn event_store(args: &Cli) -> babysteps::pg_store::Store {
    babysteps::pg_store::Store::new(&args.database_url)
        .await
        .unwrap()
}

#[cfg(feature = "sled")]
#[cfg(not(feature = "postgres"))]
async fn event_store(args: &Cli) -> babysteps::sled_store::Store {
    babysteps::sled_store::Store::new(Some(args.database_dir.clone())).unwrap()
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Url of the backing Postgresql database
    #[cfg(feature = "postgres")]
    #[arg(long, env = "DATABASE_URL")]
    database_url: String,

    #[cfg(feature = "sled")]
    /// Directory to persist the application state
    #[arg(short, long, env = "BS_DATABASE_DIR")]
    database_dir: PathBuf,

    /// Root to serve static files
    #[arg(short, long, env = "BS_STATIC_ROOT")]
    static_root: PathBuf,

    /// Root to serve application bundle
    #[arg(short, long, env = "BS_BUNDLE_ROOT")]
    bundle_root: PathBuf,

    /// Port to serve on
    #[arg(short, long, env = "BS_PORT")]
    port: u16,

    /// IP to serve on. Should in most scenarios be either 127.0.0.1 or 0.0.0.0
    #[arg(short, long, env = "BS_IP")]
    ip: String,
}

use std::{path::PathBuf, net::IpAddr};

use clap::Parser;
