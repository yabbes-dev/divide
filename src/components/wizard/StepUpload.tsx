"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WizardAction, WizardActions, wizardButtonClass } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { cn } from "@/lib/utils";

interface StepUploadProps {
  imagePreview: string | null;
  isLoading?: boolean;
  error?: string | null;
  onSelectFile: (file: File) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function StepUpload({
  imagePreview,
  isLoading = false,
  error,
  onSelectFile,
  onContinue,
  onCancel,
}: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
          <p className="text-center text-sm text-destructive">{error}</p>
        </BlurFade>
      )}

      <WizardActions>
        <BlurFade delay={0.08}>
          <WizardAction disabled={!imagePreview || isLoading} onClick={onContinue}>
            {isLoading ? "Processing..." : "Continue"}
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} disabled={isLoading} />
      </WizardActions>
    </div>
  );
}
