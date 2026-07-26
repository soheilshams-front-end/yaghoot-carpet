type Props = {
  children: React.ReactNode;
  className?: string;
};

export function ArchBackdrop({ children, className = "" }: Props) {
  return (
    <div className={`relative flex items-end justify-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/shah-abbasi/persian-arch.svg"
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 top-8 mx-auto h-[92%] w-auto max-w-[min(420px,85vw)] object-contain opacity-95"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
