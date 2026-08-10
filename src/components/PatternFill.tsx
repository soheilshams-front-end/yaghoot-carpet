export type PatternMotif = "floral" | "islimi" | "ornament" | "scroll";

const MOTIF_SRC: Record<PatternMotif, string> = {
  floral: "/shah-abbasi/carpet-pattern-a.webp",
  islimi: "/shah-abbasi/carpet-pattern-b.webp",
  ornament: "/shah-abbasi/carpet-pattern-a.webp",
  scroll: "/shah-abbasi/carpet-pattern-b.webp",
};

const MOTIF_SIZE: Record<PatternMotif, number> = {
  floral: 520,
  islimi: 480,
  ornament: 360,
  scroll: 620,
};

const MOTIF_POS: Record<PatternMotif, string> = {
  floral: "center top",
  islimi: "left center",
  ornament: "right 20%",
  scroll: "center 40%",
};

type Props = {
  className?: string;
  opacity?: number;
  size?: number;
  invert?: boolean;
  motif?: PatternMotif;
};

/** Previous working carpet pattern fill — faint watermark */
export function PatternFill({
  className = "",
  opacity = 0.05,
  size,
  invert = false,
  motif = "floral",
}: Props) {
  const tile = size ?? MOTIF_SIZE[motif];
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      style={{
        opacity,
        backgroundImage: `url(${MOTIF_SRC[motif]})`,
        backgroundSize: `${tile}px auto`,
        backgroundRepeat: "repeat",
        backgroundPosition: MOTIF_POS[motif],
        mixBlendMode: invert ? "soft-light" : "multiply",
        filter: invert
          ? "brightness(1.35) saturate(0.55) contrast(0.9)"
          : "saturate(0.7) contrast(0.95) brightness(1.05)",
      }}
      aria-hidden
    />
  );
}
