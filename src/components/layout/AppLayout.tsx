"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DivideLogo } from "@/components/brand/DivideLogo";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  onBack?: () => void;
}

export function AppLayout({
  children,
  title,
  description,
  className,
  onBack,
}: AppLayoutProps) {
  return (
    <div className="app-shell relative flex min-h-dvh w-full flex-col overflow-hidden">
      <DotPattern className="opacity-30 dark:opacity-40" />
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-14 w-full max-w-lg items-center justify-center px-4">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 h-9 -translate-y-1/2 gap-0.5 px-2 text-muted-foreground hover:text-foreground"
              onClick={onBack}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          )}
          <Link href="/" className="text-foreground" aria-label="Divide home">
            <DivideLogo variant="mark" size={28} />
          </Link>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 min-h-0 flex-col overflow-y-auto">
        <div
          className={cn(
            "flex w-full flex-1 flex-col justify-center gap-6 px-5 pt-5",
            "pb-[max(2rem,env(safe-area-inset-bottom))]",
            className,
          )}
        >
          {(title || description) && (
            <div className="text-center">
              {title && <h1 className="text-title">{title}</h1>}
              {description && (
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="flex w-full flex-col items-stretch gap-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
