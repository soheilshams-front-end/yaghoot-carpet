type Props = {
  className?: string;
  /** top = روی سکشن آبی (قله به سمت بالا)؛ bottom = پایین سکشن آبی (برعکس) */
  placement?: "top" | "bottom";
  variant?: "wave" | "scallop";
};

/**
 * موج نرم فقط برای سکشن‌های سرمه‌ای.
 * fill همیشه سرمه‌ای است تا به کرم نچسبد.
 */
export function TornEdge({
  className = "",
  placement = "top",
  variant = "wave",
}: Props) {
  const fill = "var(--sa-navy)";
  const flipped = placement === "bottom";

  return (
    <div
      className={`pointer-events-none relative z-[2] w-full overflow-hidden leading-none ${
        placement === "top" ? "-mb-px" : "-mt-px"
      } ${className}`}
      aria-hidden
    >
      <svg
        className={`block h-11 w-full sm:h-12 md:h-14 ${flipped ? "rotate-180" : ""}`}
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {variant === "scallop" ? (
          <path
            fill={fill}
            d="M0,96 H1440 V55 C1410,55 1395,18 1365,18 S1320,55 1290,55 S1245,18 1215,18 S1170,55 1140,55 S1095,18 1065,18 S1020,55 990,55 S945,18 915,18 S870,55 840,55 S795,18 765,18 S720,55 690,55 S645,18 615,18 S570,55 540,55 S495,18 465,18 S420,55 390,55 S345,18 315,18 S270,55 240,55 S195,18 165,18 S120,55 90,55 S45,18 15,18 C10,18 5,30 0,40 V96 Z"
          />
        ) : (
          <>
            <path
              fill={fill}
              opacity="0.4"
              d="M0,96 L1440,96 L1440,48 C1260,18 1080,68 900,40 C720,12 540,62 360,38 C180,14 90,50 0,34 Z"
            />
            <path
              fill={fill}
              d="M0,96 L1440,96 L1440,58 C1280,28 1120,70 960,46 C800,22 640,66 480,42 C320,18 160,58 0,44 Z"
            />
          </>
        )}
      </svg>
    </div>
  );
}
