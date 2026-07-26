import Link from "next/link";

type Props = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionHref = "/rugs",
  actionLabel = "مشاهده فروشگاه",
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[var(--sa-border)] bg-[var(--sa-bg)] px-4 py-14 text-center ${className}`}
    >
      <p className="text-base font-semibold text-[var(--sa-navy)] sm:text-lg">{title}</p>
      <p className="mt-2 text-sm text-[var(--sa-text-muted)]">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-[var(--sa-navy)] px-5 text-sm text-[var(--sa-text-on-navy)]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
