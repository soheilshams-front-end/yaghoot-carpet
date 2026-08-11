import { mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";

const MAX_UPLOADS_DIR_BYTES = 500 * 1024 * 1024;

const FALLBACK_UPLOADS_DIR = ["public", "uploads"].join(path.sep);

/** Absolute uploads dir when set (VPS); otherwise public/uploads under cwd. */
function uploadsDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  // Keeping the path non-constant stops the bundler from tracing the directory
  // as a build asset; in production it is a mount outside the project root.
  return path.resolve(process.cwd(), fromEnv || FALLBACK_UPLOADS_DIR);
}

async function folderByteSize(dir: string): Promise<number> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    let total = 0;
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += await folderByteSize(full);
      } else if (entry.isFile()) {
        total += (await stat(full)).size;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

function buildFileName(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
}

/** Persist processed WebP bytes; returns public URL path (/uploads/…). */
export async function saveImage(buffer: Buffer): Promise<string> {
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });

  const used = await folderByteSize(dir);
  if (used + buffer.byteLength > MAX_UPLOADS_DIR_BYTES) {
    throw new Error("UPLOAD_QUOTA");
  }

  const name = buildFileName();
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}

const UPLOAD_FILE_PATTERN = /^\/uploads\/[a-zA-Z0-9._-]+\.webp$/;

export function isLocalUploadUrl(url: string): boolean {
  return UPLOAD_FILE_PATTERN.test(url.trim());
}

export async function deleteStoredFile(url: string): Promise<void> {
  if (!isLocalUploadUrl(url)) return;

  const dir = uploadsDir();
  const filePath = path.resolve(dir, path.basename(url));
  if (!filePath.startsWith(dir + path.sep)) return;

  const { unlink } = await import("fs/promises");
  try {
    await unlink(filePath);
  } catch {
    /* best-effort */
  }
}
