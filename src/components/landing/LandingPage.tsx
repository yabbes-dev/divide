"use client";

import { DivideLogo } from "@/components/brand/DivideLogo";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { TypewriterText } from "@/components/magicui/typewriter-text";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="app-shell relative flex min-h-dvh w-full flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
      <DotPattern className="opacity-40 dark:opacity-60" />
      <div className="absolute right-4 top-[env(safe-area-inset-top)] z-50 pt-2.5">
        <ThemeToggle />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-primary/15 blur-3xl"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 pb-[max(4rem,env(safe-area-inset-bottom))] text-center">
        <BlurFade delay={0.05}>
          <div className="relative mb-8 flex flex-col items-center gap-4">
            <div
              className="pointer-events-none absolute inset-0 -m-10 bg-primary/25 blur-3xl"
              aria-hidden
            />
            <DivideLogo variant="mark" size={80} className="relative" />
            <DivideLogo variant="wordmark" size={36} className="relative" />
          </div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <h1 className="text-display">
            <AnimatedGradientText>Split receipts fairly</AnimatedGradientText>
          </h1>
        </BlurFade>

        <BlurFade delay={0.15} className="mt-4">
          <TypewriterText text="Upload. Assign. Done." className="mx-auto max-w-xs" />
        </BlurFade>

        <BlurFade delay={0.2} className="mt-10">
          <WizardActions>
            <div className="relative overflow-hidden">
              <BorderBeam size={180} duration={10} />
              <WizardAction className="relative z-10" onClick={onGetStarted}>
                Get Started
              </WizardAction>
            </div>
          </WizardActions>
        </BlurFade>
      </main>
    </div>
  );
}
