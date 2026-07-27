import { mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";

const MAX_UPLOADS_DIR_BYTES = 500 * 1024 * 1024;

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

/** Persist processed WebP bytes to public/uploads; returns public URL path. */
export async function saveImage(buffer: Buffer): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const used = await folderByteSize(dir);
  if (used + buffer.byteLength > MAX_UPLOADS_DIR_BYTES) {
    throw new Error("UPLOAD_QUOTA");
  }

  const name = buildFileName();
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}

export function isLocalUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/");
}

export async function deleteStoredFile(url: string): Promise<void> {
  if (!isLocalUploadUrl(url)) return;

  const { unlink } = await import("fs/promises");
  const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await unlink(filePath);
  } catch {
    /* best-effort */
  }
}
