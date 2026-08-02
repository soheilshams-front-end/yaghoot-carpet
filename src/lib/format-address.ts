/** Join city + street without duplicating a city already present in address. */
export function formatOrderAddress(
  city: string | null | undefined,
  address: string | null | undefined,
): string {
  const c = city?.trim() ?? "";
  const a = address?.trim() ?? "";
  if (!c) return a;
  if (!a) return c;
  if (a === c || a.startsWith(`${c}،`) || a.startsWith(`${c},`) || a.startsWith(`${c} `)) {
    return a;
  }
  return `${c}، ${a}`;
}
