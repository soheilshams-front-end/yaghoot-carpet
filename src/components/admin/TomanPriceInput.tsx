"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  className?: string;
  id?: string;
  /** When false, omit the built-in label (caller wraps its own). Default true. */
  showLabel?: boolean;
};

function digitsOnly(raw: string) {
  return raw.replace(/\D/g, "");
}

function formatTomanDigits(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "";
  return Math.trunc(n).toLocaleString("en-US");
}

/** ورودی قیمت ۱۲ متری با جداکننده هزارگان (تومان) */
export function TomanPriceInput({
  value,
  onChange,
  required,
  className,
  id,
  showLabel = true,
}: Props) {
  const display = formatTomanDigits(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = digitsOnly(e.target.value);
    onChange(digits ? Number(digits) : 0);
  }

  const input = (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      required={required}
      value={display}
      onChange={handleChange}
      placeholder="مثلاً ۱۲,۵۰۰,۰۰۰"
      className={
        className ??
        "w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]"
      }
    />
  );

  if (!showLabel) return input;

  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">قیمت ۱۲ متری (۳×۴) — تومان</span>
      {input}
    </label>
  );
}
