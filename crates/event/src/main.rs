fn main() -> std::io::Result<()> {
    let event_ts = format!(
        "// TypeScript Type Definitions for Event Module
{}

{}

{}

{}

{}

{}

{}",
        Event::decl(),
        EventType::decl(),
        FoodType::decl(),
        Meal::decl(),
        NapStart::decl(),
        NapEnd::decl(),
        NapLocation::decl(),
    );

    // Ensure the 'bindings' directory exists
    let path = Path::new("bindings");
    if !path.exists() {
        fs::create_dir(path)?;
    }

    // Write to the bindings/event.ts file
    fs::write(path.join("event.ts"), event_ts)?;

    println!("TypeScript type definitions generated in bindings/event.ts.");

    Ok(())
}

use ts_rs::TS;

use babysteps_event::*;

use std::fs;
use std::path::Path;
