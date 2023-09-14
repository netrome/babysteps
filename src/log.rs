pub fn init() -> Result<(), tracing::subscriber::SetGlobalDefaultError> {
    let subscriber = tracing_subscriber::fmt::Subscriber::builder()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_timer(tracing_subscriber::fmt::time::UtcTime::rfc_3339())
        .finish();

    tracing::subscriber::set_global_default(subscriber)?;
    Ok(())
}
