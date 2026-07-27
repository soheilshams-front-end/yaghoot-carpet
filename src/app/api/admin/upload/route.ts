import sharp from "sharp";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { saveImage } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

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

    const url = await saveImage(webp);
    const alt = String(form.get("alt") ?? "").trim();
    await prisma.mediaAsset.create({ data: { url, alt } });

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "UPLOAD_QUOTA") {
      return NextResponse.json(
        { ok: false, error: "ظرفیت فضای آپلود پر شده است" },
        { status: 413 },
      );
    }
    if (message === "BLOB_TOKEN_MISSING") {
      return NextResponse.json(
        { ok: false, error: "تنظیمات ذخیره‌سازی ابری ناقص است" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: false, error: "تبدیل تصویر ناموفق بود" }, { status: 500 });
  }
}
