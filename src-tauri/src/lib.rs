// Define the return struct
use std::fs::File;
use std::io::BufReader;
use kamadak_exif::{Reader, In, Tag};

#[derive(serde::Serialize)]
struct ImageDimensions {
    width: usize,
    height: usize,
    size: u64,
    // Optional EXIF metadata for RAW files
    iso: Option<u32>,
    aperture: Option<String>,
    shutter_speed: Option<String>,
    camera_model: Option<String>,
    is_raw: bool,
}

/// List of RAW file extensions
const RAW_EXTENSIONS: &[&str] = &[
    // Canon
    "cr2", "cr3", "crw",
    // Nikon
    "nef", "nrw",
    // Sony
    "arw", "srf", "sr2",
    // Fuji
    "raf",
    // Olympus
    "orf",
    // Panasonic
    "rw2",
    // Pentax
    "pef", "ptx",
    // Leica
    "rwl", "rwz",
    // Adobe / Universal
    "dng",
    // Other professional formats
    "raw", "3fr", "ari", "bay", "cap", "iiq", "eip", "erf",
    "fff", "mef", "mdc", "mos", "mrw", "pxn", "r3d", "x3f",
];

/// Check if file has a RAW extension
fn is_raw_extension(path: &str) -> bool {
    if let Some(ext) = path.split('.').last() {
        RAW_EXTENSIONS.contains(&ext.to_lowercase().as_str())
    } else {
        false
    }
}

/// Extract dimensions from EXIF data (for RAW files)
fn get_dimensions_from_exif(path: &str) -> Result<(usize, usize), String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let mut buf_reader = BufReader::new(file);
    
    let exif_reader = Reader::new()
        .read_from_container(&mut buf_reader)
        .map_err(|e| format!("Failed to read EXIF: {}", e))?;
    
    let width = exif_reader
        .get_field(Tag::ImageWidth, In::PRIMARY)
        .and_then(|f| f.value.get_uint(0))
        .ok_or("No width in EXIF")?;
    
    let height = exif_reader
        .get_field(Tag::ImageLength, In::PRIMARY)
        .and_then(|f| f.value.get_uint(0))
        .ok_or("No height in EXIF")?;
    
    Ok((width as usize, height as usize))
}

/// Extract optional EXIF metadata (ISO, aperture, shutter, camera model)
fn extract_exif_metadata(path: &str) -> (Option<u32>, Option<String>, Option<String>, Option<String>) {
    let file = match File::open(path) {
        Ok(f) => f,
        Err(_) => return (None, None, None, None),
    };
    
    let mut buf_reader = BufReader::new(file);
    let exif = match Reader::new().read_from_container(&mut buf_reader) {
        Ok(e) => e,
        Err(_) => return (None, None, None, None),
    };
    
    let iso = exif
        .get_field(Tag::PhotographicSensitivity, In::PRIMARY)
        .and_then(|f| f.value.get_uint(0))
        .map(|v| v as u32);
    
    let aperture = exif
        .get_field(Tag::FNumber, In::PRIMARY)
        .map(|f| format!("f/{}", f.display_value().with_unit(&exif)));
    
    let shutter = exif
        .get_field(Tag::ExposureTime, In::PRIMARY)
        .map(|f| format!("{}", f.display_value().with_unit(&exif)));
    
    let camera = exif
        .get_field(Tag::Model, In::PRIMARY)
        .map(|f| format!("{}", f.display_value().with_unit(&exif)));
    
    (iso, aperture, shutter, camera)
}

#[tauri::command]
fn get_image_dimensions(path: String) -> Result<ImageDimensions, String> {
    let is_raw = is_raw_extension(&path);
    let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
    
    let (width, height) = if is_raw {
        // For RAW files: use EXIF extraction
        get_dimensions_from_exif(&path)?
    } else {
        // For standard formats: use imagesize library
        match imagesize::size(&path) {
            Ok(dim) => (dim.width, dim.height),
            Err(e) => return Err(e.to_string()),
        }
    };
    
    // Extract EXIF metadata (RAW files only)
    let (iso, aperture, shutter_speed, camera_model) = if is_raw {
        extract_exif_metadata(&path)
    } else {
        (None, None, None, None)
    };
    
    Ok(ImageDimensions {
        width,
        height,
        size,
        iso,
        aperture,
        shutter_speed,
        camera_model,
        is_raw,
    })
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
