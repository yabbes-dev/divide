"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, Hourglass, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WizardAction, WizardActions, wizardButtonClass } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { DinoGame } from "@/components/games/DinoGame";
import {
  formatRetryCountdown,
  isRateLimitUiError,
} from "@/lib/api/parse-errors";
import { cn } from "@/lib/utils";

interface StepUploadProps {
  imagePreview: string | null;
  isLoading?: boolean;
  error?: string | null;
  errorCode?: string | null;
  retryAfterMs?: number | null;
  onSelectFile: (file: File) => void;
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
  onContinue,
  onCancel,
}: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { secondsLeft, canRetry } = useRetryCountdown(retryAfterMs);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file?.type.startsWith("image/")) return;
      onSelectFile(file);
    },
    [onSelectFile],
  );

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
        <Card>
          <CardContent className="space-y-4 pt-4">
            <motion.div
              role="button"
              tabIndex={0}
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
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-6"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="max-h-48 w-full object-contain"
                />
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center text-primary">
                    <ImagePlus className="size-6" />
                  </div>
                  <p className="text-center text-sm font-medium text-foreground">
                    Upload
                  </p>
                  <p className="max-w-xs text-center text-xs text-muted-foreground">
                    Use a flat, well-lit photo so prices are easy to read.
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
                className={cn(wizardButtonClass, "w-auto")}
                onClick={openCamera}
              >
                <Camera className="size-4" />
                Take Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      </BlurFade>

      {error && (
        <BlurFade>
          {isRateLimitError ? (
            <Card className="relative overflow-hidden border-primary/25 shadow-card">
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
            <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4">
              <p className="text-center text-sm text-destructive">{error}</p>
            </div>
          )}
        </BlurFade>
      )}

      <WizardActions>
        <BlurFade delay={0.08}>
          <WizardAction disabled={tryAgainDisabled} onClick={onContinue}>
            {isLoading
              ? "Processing..."
              : isRateLimitError
                ? canRetry
                  ? "Try again"
                  : `Wait ${formatRetryCountdown(secondsLeft)}`
                : "Continue"}
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} disabled={isLoading} />
      </WizardActions>
    </div>
  );
}
