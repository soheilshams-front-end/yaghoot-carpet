import { SaSpinner } from "@/components/loading/SaSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[var(--sa-cream)]/90 px-4 backdrop-blur-[2px]">
      <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-8 py-7 shadow-[0_18px_50px_rgba(30,58,95,0.12)]">
        <SaSpinner size="lg" label="در حال بارگذاری داشبورد…" />
      </div>
    </div>
  );
}
