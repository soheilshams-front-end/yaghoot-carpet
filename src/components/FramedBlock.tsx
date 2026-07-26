/** Navy frame with tiny margin + faint corner motifs (for hero-like blocks). */
export function FramedBlock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sa-framed relative ${className}`}>
      <span className="sa-motif sa-motif-tl" aria-hidden />
      <span className="sa-motif sa-motif-tr" aria-hidden />
      <span className="sa-motif sa-motif-bl" aria-hidden />
      <span className="sa-motif sa-motif-br" aria-hidden />
      <div className="sa-framed-inner relative z-[1]">{children}</div>
    </div>
  );
}
