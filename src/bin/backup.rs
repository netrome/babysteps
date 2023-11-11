#[tokio::main]
async fn main() {
    let args = Cli::parse();

    match args.op {
        Op::Push => push_events_to_service(args)
            .await
            .expect("Failed to push events"),
        Op::Pull => pull_events_from_service(args)
            .await
            .expect("Failed to pull events"),
    };
}

async fn push_events_to_service(args: Cli) -> anyhow::Result<()> {
    let mut url = reqwest::Url::parse(&args.babysteps_url)?;
    url.set_path("/api/event/add");

    let events: Vec<Event> = serde_json::from_slice(&std::fs::read(args.backup_file)?)?;
    let client = reqwest::Client::new();

    let handles: Vec<_> = events
        .into_iter()
        .map(|event| {
            let url = url.clone();
            let client = client.clone();

            tokio::spawn(async move {
                client
                    .post(url)
                    .json(&event)
                    .send()
                    .await
                    .expect("Failed to post event");
            })
        })
        .collect();

    for handle in handles {
        handle.await?;
    }

    Ok(())
}

async fn pull_events_from_service(args: Cli) -> anyhow::Result<()> {
    let mut url = reqwest::Url::parse(&args.babysteps_url)?;
    url.set_path("/api/events");
    url.set_query(Some("count=100000"));

    let events: Vec<Event> = reqwest::get(url).await?.json().await?;
    let serialized_events = serde_json::to_string(&events)?;

    std::fs::write(args.backup_file, serialized_events)?;

    Ok(())
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[arg(long)]
    babysteps_url: String,

    #[arg(long)]
    backup_file: PathBuf,

    #[arg(long)]
    op: Op,
}

#[derive(Debug, Clone, clap::ValueEnum)]
enum Op {
    Push,
    Pull,
}

use std::path::PathBuf;

use clap::Parser;

use babysteps::event::Event;
