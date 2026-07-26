import Link from "next/link";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "outline" | "solid" | "gold";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants = {
  outline:
    "border border-white/30 bg-[var(--sa-navy-deep)] text-[var(--sa-text-on-navy)] hover:border-[var(--sa-gold)]",
  solid:
    "border border-[var(--sa-navy)] bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] hover:bg-[var(--sa-navy-muted)]",
  gold:
    "border border-[var(--sa-gold)] bg-[var(--sa-gold)] text-[var(--sa-text)] hover:brightness-105",
};

export function SaButton({
  href,
  children,
  variant = "outline",
  className = "",
  onClick,
  type = "button",
  disabled,
}: Props) {
  const cls = `inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--sa-radius-btn)] px-2.5 text-[11px] sm:h-auto sm:px-4 sm:py-2 sm:text-sm ${variants[variant]} ${className} ${disabled ? "opacity-50 pointer-events-none" : ""}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
