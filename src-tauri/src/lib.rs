use std::{
  path::{Path, PathBuf},
  sync::Mutex,
};

use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_fs::FsExt;

#[cfg(windows)]
fn match_theme(window: &tauri::Window, theme: tauri::Theme) {
  let icon = match theme {
    tauri::Theme::Dark => tauri::include_image!("icons/window-dark.png"),
    _ => tauri::include_image!("icons/window-light.png"),
  };
  let _ = window.set_icon(icon);
}

#[tauri::command]
fn print(window: tauri::WebviewWindow) -> Result<(), String> {
  window.print().map_err(|e| e.to_string())
}

#[derive(Default)]
struct OpenedFiles(Mutex<Vec<String>>);

#[tauri::command]
fn take_opened_files(opened: tauri::State<OpenedFiles>) -> Vec<String> {
  std::mem::take(&mut *opened.0.lock().unwrap())
}

const OPENABLE: [&str; 3] = ["liyun", "docx", "json"];

fn openable(path: &Path) -> bool {
  path.is_file()
    && path
      .extension()
      .and_then(|e| e.to_str())
      .is_some_and(|e| OPENABLE.contains(&e.to_ascii_lowercase().as_str()))
}

fn open_files(app: &AppHandle, paths: impl IntoIterator<Item = PathBuf>) {
  let paths: Vec<PathBuf> = paths.into_iter().filter(|p| openable(p)).collect();
  if paths.is_empty() {
    return;
  }
  {
    let opened = app.state::<OpenedFiles>();
    let mut queue = opened.0.lock().unwrap();
    for path in paths {
      let _ = app.fs_scope().allow_file(&path);
      queue.push(path.to_string_lossy().into_owned());
    }
  }
  let _ = app.emit("opened-files", ());
  if let Some(window) = app.get_webview_window("main") {
    let _ = window.unminimize();
    let _ = window.set_focus();
  }
}

fn paths_from_args(args: &[String], cwd: &Path) -> Vec<PathBuf> {
  args.iter().skip(1).map(|a| cwd.join(a)).collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
      open_files(app, paths_from_args(&args, Path::new(&cwd)));
    }))
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_persisted_scope::init())
    .manage(OpenedFiles::default())
    .invoke_handler(tauri::generate_handler![print, take_opened_files])
    .on_window_event(|_window, _event| {
      #[cfg(windows)]
      if let tauri::WindowEvent::ThemeChanged(theme) = _event {
        match_theme(_window, *theme);
      }
    })
    .setup(|app| {
      #[cfg(windows)]
      if let Some(window) = app.get_webview_window("main") {
        let window = window.as_ref().window();
        if let Ok(theme) = window.theme() {
          match_theme(&window, theme);
        }
      }
      let args: Vec<String> = std::env::args().collect();
      let cwd = std::env::current_dir().unwrap_or_default();
      open_files(app.handle(), paths_from_args(&args, &cwd));
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building Liyun")
    .run(|_app, _event| {
      #[cfg(target_os = "macos")]
      if let tauri::RunEvent::Opened { urls } = _event {
        let paths = urls.into_iter().filter_map(|u| u.to_file_path().ok());
        open_files(_app, paths);
      }
    });
}
