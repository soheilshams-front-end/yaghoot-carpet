/** Shared Persian-safe slug helpers */

export function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || `item-${Date.now()}`
  );
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base);
  if (!(await exists(root))) return root;
  for (let i = 2; i < 100; i++) {
    const candidate = `${root.slice(0, 60)}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root.slice(0, 50)}-${Date.now()}`;
}
