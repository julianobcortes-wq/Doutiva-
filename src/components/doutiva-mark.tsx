import { cn } from "@/lib/utils";
import mark from "@/assets/brand/doutiva-mark.png";

type DoutivaMarkProps = {
  className?: string;
  /** Visual scale for nav, footer, hero, etc. */
  size?: "sm" | "md" | "lg" | "hero";
  title?: string;
};

const sizeClass = {
  sm: "h-9 w-9",
  md: "h-14 w-14",
  lg: "h-28 w-28 md:h-36 md:w-36",
  hero: "h-auto w-[min(100%,28rem)] max-w-full aspect-square",
} as const;

/**
 * Marca oficial Doutiva — o arquivo enviado, sem recriação tipográfica.
 */
export function DoutivaMark({
  className,
  size = "md",
  title = "Doutiva",
}: DoutivaMarkProps) {
  return (
    <img
      src={mark}
      alt={title || "Doutiva"}
      width={1254}
      height={1254}
      decoding="async"
      className={cn(
        "doutiva-mark block object-cover object-center select-none",
        sizeClass[size],
        className,
      )}
      draggable={false}
    />
  );
}
