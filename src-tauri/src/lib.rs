// Define the return struct
#[derive(serde::Serialize)]
struct ImageDimensions {
    width: usize,
    height: usize,
    size: u64,
}

#[tauri::command]
fn get_image_dimensions(path: String) -> Result<ImageDimensions, String> {
    match imagesize::size(&path) {
        Ok(dim) => {
            // Get file size too
            let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
            Ok(ImageDimensions {
                width: dim.width,
                height: dim.height,
                size,
            })
        },
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![get_image_dimensions])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
