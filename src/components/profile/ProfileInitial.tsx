import { getAvatarPalette } from "@/components/wizard/PersonAvatarChip";
import { cn } from "@/lib/utils";

interface ProfileInitialProps {
  name: string;
  /** sm fits the header control. md matches the bill avatars. */
  size?: "sm" | "md";
  className?: string;
}

export function ProfileInitial({ name, size = "md", className }: ProfileInitialProps) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  const palette = getAvatarPalette(0);
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-foreground ring-2 ring-offset-background",
        compact ? "size-8 text-sm ring-offset-1" : "size-11 text-lg ring-offset-2",
        palette.surface,
        palette.ring,
        "shadow-[0_4px_14px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.35)]",
        className,
      )}
      aria-hidden
    >
      {letter}
    </div>
  );
}
