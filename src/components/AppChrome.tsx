import { SiteHeader } from "@/components/SiteHeader";
import { PatternFill } from "@/components/PatternFill";

/** For non-home routes: patterned cream header shell */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sa-framed">
        <span className="sa-motif sa-motif-tl" aria-hidden />
        <span className="sa-motif sa-motif-tr" aria-hidden />
        <span className="sa-motif sa-motif-bl" aria-hidden />
        <span className="sa-motif sa-motif-br" aria-hidden />
        <div className="sa-framed-inner relative">
          <PatternFill motif="floral" opacity={0.05} size={460} />
          <SiteHeader embedded />
        </div>
      </div>
      {children}
    </>
  );
}
