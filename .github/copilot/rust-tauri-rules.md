# Rust & Tauri Ruleset

## Project Structure

Tauri backend follows this structure:
```
src-tauri/
├── src/
│   ├── main.rs          # Application entry point
│   ├── lib.rs           # Library root (if needed)
│   └── commands/        # Tauri commands
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration
```

## Command Patterns

### Basic Command
```rust
use tauri::command;

#[command]
fn simple_command(value: String) -> Result<String, String> {
    // Validation
    if value.is_empty() {
        return Err("Value cannot be empty".to_string());
    }
    
    // Business logic
    let result = process_value(&value);
    
    Ok(result)
}
```

### Command with State
```rust
use tauri::{command, State};
use std::sync::Mutex;

struct AppState {
    data: Mutex<Vec<String>>,
}

#[command]
fn stateful_command(
    value: String,
    state: State<'_, AppState>
) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    
    data.push(value);
    Ok(())
}
```

### Async Command
```rust
use tauri::command;

#[command]
async fn async_command(path: String) -> Result<Vec<u8>, String> {
    let content = tokio::fs::read(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(content)
}
```

## Error Handling

### Result Type
Always use `Result<T, String>` for JavaScript interop:
```rust
#[command]
fn fallible_operation(input: i32) -> Result<i32, String> {
    if input < 0 {
        return Err("Input must be non-negative".to_string());
    }
    
    let result = input * 2;
    Ok(result)
}
```

### Error Conversion
```rust
use std::error::Error;

fn convert_error(e: impl Error) -> String {
    format!("Error: {}", e)
}

#[command]
fn operation_with_conversion() -> Result<String, String> {
    let file = std::fs::read_to_string("config.json")
        .map_err(convert_error)?;
    
    Ok(file)
}
```

## Database Operations (SQLite)

### Query Pattern
```rust
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Photo {
    id: String,
    path: String,
    name: String,
    size: i64,
}

#[command]
async fn get_photos(db: State<'_, Database>) -> Result<Vec<Photo>, String> {
    let photos = sqlx::query_as!(
        Photo,
        "SELECT id, path, name, size FROM photos ORDER BY name"
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(photos)
}
```

### Transaction Pattern
```rust
#[command]
async fn batch_insert(
    photos: Vec<Photo>,
    db: State<'_, Database>
) -> Result<(), String> {
    let mut tx = db.pool.begin()
        .await
        .map_err(|e| format!("Transaction error: {}", e))?;
    
    for photo in photos {
        sqlx::query!(
            "INSERT INTO photos (id, path, name, size) VALUES (?, ?, ?, ?)",
            photo.id, photo.path, photo.name, photo.size
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Insert error: {}", e))?;
    }
    
    tx.commit()
        .await
        .map_err(|e| format!("Commit error: {}", e))?;
    
    Ok(())
}
```

## String Handling

### Prefer &str for Parameters
```rust
// Good: Borrowed string for read-only operations
fn process_path(path: &str) -> String {
    format!("Processing: {}", path)
}

// Use String when ownership is needed
fn take_ownership(value: String) -> String {
    value.to_uppercase()
}
```

### String Conversion
```rust
// &str to String
let owned = borrowed.to_string();
let owned = borrowed.to_owned();
let owned = String::from(borrowed);

// String to &str
let borrowed: &str = &owned;
let borrowed = owned.as_str();
```

## Tauri Plugin Usage

### File System
```rust
use tauri::plugin::fs;

#[command]
async fn read_file_content(path: String) -> Result<String, String> {
    let content = fs::read_to_string(path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(content)
}
```

### Dialog
```rust
use tauri::plugin::dialog;

#[command]
async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = dialog::FileDialogBuilder::new()
        .set_directory(true)
        .pick_folder()
        .await
        .map_err(|e| format!("Dialog error: {}", e))?;
    
    Ok(path.map(|p| p.to_string_lossy().to_string()))
}
```

## Derive Macros

Always derive common traits:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Config {
    api_key: String,
    cache_size: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Status {
    Loading,
    Success,
    Error(String),
}
```

## Code Style

- Follow `rustfmt` and `clippy` recommendations
- Use descriptive variable names
- Prefer `match` over multiple `if-else`
- Use `?` operator for error propagation
- Keep functions focused and single-purpose

## Anti-Patterns to Avoid

❌ Don't panic in commands
```rust
// Bad
#[command]
fn bad_command(value: String) {
    let num: i32 = value.parse().unwrap(); // Can panic!
}

// Good
#[command]
fn good_command(value: String) -> Result<i32, String> {
    value.parse().map_err(|e| format!("Parse error: {}", e))
}
```

❌ Don't ignore errors
```rust
// Bad
let _ = risky_operation();

// Good
risky_operation().map_err(|e| eprintln!("Error: {}", e)).ok();
// Or better: propagate with ?
let result = risky_operation()?;
```

❌ Don't expose implementation details
```rust
// Bad: Returns internal error types
#[command]
fn bad_error() -> Result<String, std::io::Error> { ... }

// Good: Returns String error for JS interop
#[command]
fn good_error() -> Result<String, String> { ... }
```

## Security Considerations

- Always validate input from frontend
- Use parameterized queries to prevent SQL injection
- Follow principle of least privilege in capability files
- Sanitize file paths to prevent directory traversal
- Don't log sensitive information
