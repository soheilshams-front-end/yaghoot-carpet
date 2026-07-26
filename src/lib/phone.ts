/** Normalize Iranian mobile numbers to 09xxxxxxxxx */
export function normalizePhone(input: string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  let s = input.trim().replace(/[\s\-()]/g, "");
  s = s.replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
  s = s.replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)));
  if (s.startsWith("+98")) s = `0${s.slice(3)}`;
  else if (s.startsWith("0098")) s = `0${s.slice(4)}`;
  else if (s.startsWith("98") && s.length >= 12) s = `0${s.slice(2)}`;
  return s;
}

export function isValidIranMobile(input: string): boolean {
  return /^09\d{9}$/.test(normalizePhone(input));
}
