import { z } from "zod";
import { sanitizeGallery, sanitizeImageUrl } from "@/lib/safe-image-url";

export const productInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(64),
  price: z.number().int().min(0).max(999_999_999_999),
  stock: z.number().int().min(0).max(999_999),
  shaneh: z.number().int().min(20).max(1200),
  description: z.string().max(10_000),
  image: z.string().max(500),
  active: z.boolean(),
  colorTag: z.string().max(64).nullable().optional(),
  categoryIds: z.array(z.string().min(1)).optional(),
  gallery: z.array(z.string().max(500)).max(20),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function parseProductInput(input: unknown) {
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر" };
  }

  const data = parsed.data;
  const gallery = sanitizeGallery(
    data.gallery.length ? data.gallery : [data.image].filter(Boolean),
  );
  const imageUrl = sanitizeImageUrl(data.image.trim()) ?? gallery[0] ?? "";

  if (!data.id && !imageUrl) {
    return { ok: false as const, error: "عکس محصول لازم است (فقط مسیر /uploads/)" };
  }

  return {
    ok: true as const,
    data: {
      ...data,
      title: data.title.trim(),
      code: data.code.trim(),
      image: imageUrl,
      gallery: gallery.length ? gallery : imageUrl ? [imageUrl] : [],
    },
  };
}

export const categoryInputSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(64).optional(),
  title: z.string().trim().min(1).max(120),
  image: z.string().max(500),
  sortOrder: z.number().int().min(0).max(9999),
  active: z.boolean(),
  showInHome: z.boolean(),
  showInShop: z.boolean(),
});

export const homepagePayloadSchema = z.string().max(50_000);
