// Bridges to the desktop app. Each one is a no-op or browser fallback on the web.

export const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export type OpenedFile = { path: string; fileName: string; data: ArrayBuffer };

export const baseName = (path: string) => path.split(/[\\/]/).pop() ?? path;

async function readPath(path: string): Promise<OpenedFile> {
  const { readFile } = await import("@tauri-apps/plugin-fs");
  const bytes = await readFile(path);
  const data = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return { path, fileName: baseName(path), data };
}

export async function openNative(
  filters: { name: string; extensions: string[] }[],
): Promise<OpenedFile | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const path = await open({ multiple: false, directory: false, filters });
  return path ? readPath(path) : null;
}

export async function pickSavePath(filename: string) {
  const { save } = await import("@tauri-apps/plugin-dialog");
  const extension = filename.split(".").pop() ?? "";
  return save({
    defaultPath: filename,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
  });
}

export async function writePath(path: string, blob: Blob) {
  const { writeFile } = await import("@tauri-apps/plugin-fs");
  await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

// The desktop webview ignores <a download>, so ask for a path and write it.
export async function saveNative(blob: Blob, filename: string) {
  const path = await pickSavePath(filename);
  if (path) await writePath(path, blob);
  return path;
}

// Files the OS asks the app to open (double-click, Open With, drop on the
// icon). The app queues them until the page takes them, so none are lost
// while it starts up. Returns a function that stops listening.
export function onOpenedFiles(handle: (file: OpenedFile) => void) {
  if (!isTauri()) return () => {};
  let stopped = false;
  let unlisten = () => {};
  const take = async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    const paths = await invoke<string[]>("take_opened_files");
    for (const path of paths) {
      if (stopped) return;
      try {
        handle(await readPath(path));
      } catch (error) {
        window.alert(`Could not open ${baseName(path)}: ${error}`);
      }
    }
  };
  (async () => {
    const { listen } = await import("@tauri-apps/api/event");
    const stop = await listen("opened-files", () => void take());
    if (stopped) stop();
    else unlisten = stop;
    await take();
  })();
  return () => {
    stopped = true;
    unlisten();
  };
}

// The macOS webview ignores window.print(), so the desktop app prints natively.
// Native printing may skip beforeprint, which fills the print layout.
export async function print() {
  if (!isTauri()) return window.print();
  window.dispatchEvent(new Event("beforeprint"));
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("print");
}

// Browsers and the print panel name a saved PDF after the page title.
export async function setDocumentTitle(title: string) {
  document.title = title;
  if (!isTauri()) return;
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().setTitle(title);
}
