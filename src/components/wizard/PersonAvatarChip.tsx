"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Pastel ring colours — each person gets a unique slot by list index. */
const AVATAR_PALETTES = [
  {
    ring: "ring-primary/40",
    badge: "bg-primary text-primary-foreground",
    surface: "bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5",
  },
  {
    ring: "ring-success/40",
    badge: "bg-success text-white",
    surface: "bg-gradient-to-br from-success/30 via-success/15 to-success/5",
  },
  {
    ring: "ring-info/40",
    badge: "bg-info text-white",
    surface: "bg-gradient-to-br from-info/30 via-info/15 to-info/5",
  },
  {
    ring: "ring-warning/40",
    badge: "bg-warning text-white",
    surface: "bg-gradient-to-br from-warning/30 via-warning/15 to-warning/5",
  },
  {
    ring: "ring-chart-2/40",
    badge: "bg-chart-2 text-white",
    surface: "bg-gradient-to-br from-chart-2/30 via-chart-2/15 to-chart-2/5",
  },
  {
    ring: "ring-chart-4/40",
    badge: "bg-chart-4 text-white",
    surface: "bg-gradient-to-br from-chart-4/30 via-chart-4/15 to-chart-4/5",
  },
  {
    ring: "ring-chart-5/40",
    badge: "bg-chart-5 text-white",
    surface: "bg-gradient-to-br from-chart-5/30 via-chart-5/15 to-chart-5/5",
  },
  {
    ring: "ring-chart-3/40",
    badge: "bg-chart-3 text-white",
    surface: "bg-gradient-to-br from-chart-3/30 via-chart-3/15 to-chart-3/5",
  },
] as const;

export type AvatarPalette = (typeof AVATAR_PALETTES)[number];

/** Animals only — no humans, objects, or food. */
const AVATAR_EMOJI = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦉", "🦆",
  "🐙", "🦋", "🐢", "🦔", "🐳", "🐬", "🦭", "🐠", "🦀", "🐌",
  "🐝", "🐞", "🦩", "🦄", "🦎", "🐊", "🦘", "🐘", "🦒", "🐪",
  "🐑", "🐐", "🦌", "🐿️", "🦫", "🦦", "🦥", "🦨", "🦡",
  "🦈", "🐋", "🦐", "🦑", "🐡", "🦞", "🦜", "🦚", "🦢",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Stable animal icon from name — never human-like. */
export function getPersonAvatarEmoji(name: string): string {
  const seed = name.trim().toLowerCase() || "guest";
  return AVATAR_EMOJI[hashString(seed) % AVATAR_EMOJI.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

export function getAvatarPalette(colorIndex: number): AvatarPalette {
  return AVATAR_PALETTES[((colorIndex % AVATAR_PALETTES.length) + AVATAR_PALETTES.length) % AVATAR_PALETTES.length];
}

interface PersonAvatarProps {
  name: string;
  colorIndex?: number;
  selected?: boolean;
  showName?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function PersonAvatar({
  name,
  colorIndex = 0,
  selected = false,
  showName = true,
  onRemove,
  className,
}: PersonAvatarProps) {
  const palette = getAvatarPalette(colorIndex);
  const emoji = useMemo(() => getPersonAvatarEmoji(name), [name]);

  return (
    <div className={cn("flex w-16 flex-col items-center gap-1.5", className)}>
      <div className="relative">
        <div
          className={cn(
            "flex size-11 items-center justify-center overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow",
            palette.surface,
            "shadow-[0_4px_14px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.35)]",
            "transition-transform active:scale-95",
            selected ? cn("ring-4 shadow-md", palette.ring) : palette.ring,
          )}
        >
          <span
            className="text-[1.625rem] leading-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)] select-none"
            aria-hidden
          >
            {emoji}
          </span>
        </div>
        {selected && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full",
              palette.badge,
            )}
          >
            <Check className="size-2.5" aria-hidden />
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1.5 -top-1.5 flex size-7 min-h-7 min-w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${name}`}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {showName && (
        <span className="w-full truncate text-center text-xs font-medium text-foreground">
          {name}
        </span>
      )}
    </div>
  );
}

interface PersonAvatarChipProps {
  name: string;
  colorIndex?: number;
  onRemove: () => void;
  className?: string;
}

export function PersonAvatarChip({
  name,
  colorIndex = 0,
  onRemove,
  className,
}: PersonAvatarChipProps) {
  return (
    <PersonAvatar
      name={name}
      colorIndex={colorIndex}
      onRemove={onRemove}
      className={className}
    />
  );
}
