import { mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_UPLOADS_DIR_BYTES = 500 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

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

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "فایل ارسال نشده" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "حداکثر حجم ۸ مگابایت" }, { status: 400 });
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input).metadata();
    if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
      return NextResponse.json({ ok: false, error: "فقط JPG، PNG یا WebP" }, { status: 400 });
    }

    const webp = await sharp(input)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const used = await folderByteSize(dir);
    if (used + webp.byteLength > MAX_UPLOADS_DIR_BYTES) {
      return NextResponse.json(
        { ok: false, error: "ظرفیت فضای آپلود پر شده است" },
        { status: 413 },
      );
    }

    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    await writeFile(path.join(dir, name), webp);

    const url = `/uploads/${name}`;
    const alt = String(form.get("alt") ?? "").trim();
    await prisma.mediaAsset.create({ data: { url, alt } });

    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: false, error: "تبدیل تصویر ناموفق بود" }, { status: 500 });
  }
}
