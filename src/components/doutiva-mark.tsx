import { cn } from "@/lib/utils";

type DoutivaMarkProps = {
  className?: string;
  /** Visual scale for nav, footer, hero, etc. */
  size?: "sm" | "md" | "lg" | "hero";
  /** Soft cyan pulse on the D spine + underline */
  animate?: boolean;
  /** Accessible label; decorative marks can pass empty and rely on parent */
  title?: string;
};

const sizeClass = {
  sm: "doutiva-mark--sm",
  md: "doutiva-mark--md",
  lg: "doutiva-mark--lg",
  hero: "doutiva-mark--hero",
} as const;

/**
 * Wordmark Doutiva — Syne (fonte display do site) com o detalhe ciano no D
 * e o traço sob OUTIVA, alinhado à marca oficial.
 */
export function DoutivaMark({
  className,
  size = "md",
  animate = false,
  title = "Doutiva",
}: DoutivaMarkProps) {
  return (
    <span
      className={cn("doutiva-mark", sizeClass[size], animate && "doutiva-mark--animate", className)}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <span className="doutiva-mark__word" aria-hidden="true">
        <span className="doutiva-mark__d">
          <span className="doutiva-mark__d-letter">D</span>
          <span className="doutiva-mark__spine" />
          <span className="doutiva-mark__flare doutiva-mark__flare--top" />
          <span className="doutiva-mark__flare doutiva-mark__flare--bottom" />
        </span>
        <span className="doutiva-mark__rest">
          <span className="doutiva-mark__letters">OUTIVA</span>
          <span className="doutiva-mark__rule" />
        </span>
      </span>
    </span>
  );
}
