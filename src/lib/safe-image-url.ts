const UPLOAD_PATTERN = /^\/uploads\/[a-zA-Z0-9._-]+\.webp$/;

export function isSafeImageUrl(url: string): boolean {
  return UPLOAD_PATTERN.test(url.trim());
}

/** Returns the URL if safe, otherwise null. */
export function sanitizeImageUrl(url: string): string | null {
  const trimmed = url.trim();
  return isSafeImageUrl(trimmed) ? trimmed : null;
}

/** Filters gallery array to safe local upload paths only. */
export function sanitizeGallery(urls: string[]): string[] {
  return urls.map(sanitizeImageUrl).filter((u): u is string => Boolean(u));
}
