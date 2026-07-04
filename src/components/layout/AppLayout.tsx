"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DivideLogo } from "@/components/brand/DivideLogo";
import { FloatingBackground } from "@/components/layout/FloatingBackground";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/types/wizard";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerExtra?: React.ReactNode;
  step?: WizardStep;
  className?: string;
  onBack?: () => void;
}

export function AppLayout({
  children,
  title,
  description,
  headerExtra,
  step,
  className,
  onBack,
}: AppLayoutProps) {
  return (
    <div className="app-shell relative flex min-h-dvh w-full flex-col overflow-hidden">
      <FloatingBackground floaters tone="subtle" />
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

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 min-h-0 flex-col overflow-y-auto">
        <div
          className={cn(
            "flex w-full flex-1 flex-col justify-center gap-6 px-5 pt-5",
            "pb-[max(2rem,env(safe-area-inset-bottom))]",
            className,
          )}
        >
          {(title || description || headerExtra) && (
            <div className="space-y-3 text-center">
              {step != null && <WizardProgress step={step} />}
              {title && <h1 className="text-title">{title}</h1>}
              {description && (
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
              {headerExtra}
            </div>
          )}
          <div className="flex w-full flex-col items-stretch gap-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
