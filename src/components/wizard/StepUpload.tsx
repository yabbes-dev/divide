"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, Hourglass, ImagePlus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { InlineNotice } from "@/components/ui/inline-notice";
import { WizardAction, WizardActions, wizardButtonClass } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { DinoGame } from "@/components/games/DinoGame";
import {
  formatRetryCountdown,
  isRateLimitUiError,
} from "@/lib/api/parse-errors";
import { cn } from "@/lib/utils";
import { wizardPanelClass } from "@/lib/wizard-styles";

interface StepUploadProps {
  imagePreview: string | null;
  isLoading?: boolean;
  error?: string | null;
  errorCode?: string | null;
  retryAfterMs?: number | null;
  onSelectFile: (file: File) => void;
  onClearImage: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

function useRetryCountdown(retryAfterMs?: number | null) {
  const deadlineRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!retryAfterMs || retryAfterMs <= 0) {
      deadlineRef.current = null;
      setSecondsLeft(0);
      return;
    }

    deadlineRef.current = Date.now() + retryAfterMs;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (!deadline) {
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [retryAfterMs]);

  return {
    secondsLeft,
    canRetry: !retryAfterMs || secondsLeft <= 0,
  };
}

export function StepUpload({
  imagePreview,
  isLoading = false,
  error,
  errorCode,
  retryAfterMs,
  onSelectFile,
  onClearImage,
  onContinue,
  onCancel,
}: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileJustSelected, setFileJustSelected] = useState(false);
  const { secondsLeft, canRetry } = useRetryCountdown(retryAfterMs);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file?.type.startsWith("image/")) return;
      onSelectFile(file);
      setFileJustSelected(true);
    },
    [onSelectFile],
  );

  useEffect(() => {
    if (!fileJustSelected) return;
    const id = window.setTimeout(() => setFileJustSelected(false), 300);
    return () => window.clearTimeout(id);
  }, [fileJustSelected]);

  function handleFileInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function openGallery() {
    fileInputRef.current?.click();
  }

  function openCamera() {
    const input = cameraInputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  }

  const isRateLimitError = isRateLimitUiError(errorCode);
  const tryAgainDisabled =
    !imagePreview || isLoading || (isRateLimitError && !canRetry);

  return (
    <div className="space-y-4">
      <BlurFade>
        <Card className={wizardPanelClass}>
          <CardContent className="space-y-4 pt-4">
            <motion.div
              role="button"
              tabIndex={0}
              aria-label="Upload receipt photo"
              onClick={openGallery}
              onKeyDown={(e) => e.key === "Enter" && openGallery()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              whileTap={{ scale: 0.99 }}
              animate={
                isDragging
                  ? {
                      borderColor: "var(--primary)",
                      backgroundColor: "oklch(0.60 0.18 262 / 10%)",
                    }
                  : {
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-sunken)",
                    }
              }
              transition={{ duration: 0.2 }}
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-[0.625rem] border-2 border-dashed p-6"
            >
              {imagePreview ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="max-h-48 w-full object-contain"
                    initial={false}
                    animate={fileJustSelected ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClearImage();
                    }}
                    disabled={isLoading}
                    className="absolute right-0 top-0 flex size-8 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    aria-label="Remove receipt photo"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <motion.div
                    className="flex size-12 items-center justify-center text-primary"
                    animate={fileJustSelected ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ImagePlus className="size-6" />
                  </motion.div>
                  <p className="text-center text-sm font-medium text-foreground">
                    Tap to upload
                  </p>
                  <p className="max-w-xs text-center text-xs text-muted-foreground">
                    Flat, well-lit photos read best.
                  </p>
                </>
              )}
            </motion.div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-hidden
              onChange={handleFileInputChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              aria-hidden
              onChange={handleFileInputChange}
            />

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className={cn(wizardButtonClass, "min-h-11 w-auto")}
                onClick={openCamera}
              >
                <Camera className="size-4" />
                Use camera
              </Button>
            </div>
          </CardContent>
        </Card>
      </BlurFade>

      {error && (
        <BlurFade>
          {isRateLimitError ? (
            <Card className={cn(wizardPanelClass, "relative overflow-hidden border-primary/40 shadow-card")}>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl"
                aria-hidden
              />
              <CardContent className="relative space-y-4 pt-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-9 items-center justify-center bg-primary/10 text-primary">
                    <Hourglass className="size-4" />
                  </div>
                  <p className="text-sm text-foreground">{error}</p>
                  {!canRetry && secondsLeft > 0 && (
                    <p className="text-xs font-medium text-primary">
                      Try again in {formatRetryCountdown(secondsLeft)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {canRetry
                      ? "You can try again now — or play while you wait."
                      : "Hang tight — play while you wait."}
                  </p>
                </div>
                <DinoGame />
              </CardContent>
            </Card>
          ) : (
            <InlineNotice variant="error">{error}</InlineNotice>
          )}
        </BlurFade>
      )}

      <WizardActions>
        <BlurFade delay={0.08}>
          <WizardAction disabled={tryAgainDisabled} onClick={onContinue}>
            {isLoading
              ? "Uploading…"
              : isRateLimitError
                ? canRetry
                  ? "Try again"
                  : `Wait ${formatRetryCountdown(secondsLeft)}`
                : "Read receipt"}
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} disabled={isLoading} />
      </WizardActions>
    </div>
  );
}
