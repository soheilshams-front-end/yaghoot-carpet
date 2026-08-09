export type SupportInfo = {
  phone: string;
  phoneDisplay: string;
};

export const SUPPORT_FALLBACK: SupportInfo = {
  phone: "09124496001",
  phoneDisplay: "۰۹۱۲۴۴۹۶۰۰۱",
};

/** Build wa.me link from Iranian mobile (09…) or intl digits. */
export function whatsappUrl(phone: string, presetText?: string): string {
  const digits = phone.replace(/\D/g, "");
  let intl = digits;
  if (digits.startsWith("0") && digits.length === 11) intl = `98${digits.slice(1)}`;
  else if (digits.startsWith("98")) intl = digits;
  else if (digits.length === 10 && digits.startsWith("9")) intl = `98${digits}`;

  const url = new URL(`https://wa.me/${intl}`);
  if (presetText?.trim()) url.searchParams.set("text", presetText.trim());
  return url.toString();
}
