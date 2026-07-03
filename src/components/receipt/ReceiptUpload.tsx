"use client";

import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";

interface ReceiptUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error?: string | null;
}

export function ReceiptUpload({ onUpload, isLoading, error }: ReceiptUploadProps) {
  // TODO: Implement drag-and-drop zone
  // TODO: Validate file type (image/jpeg, image/png, image/webp)
  // TODO: Show preview of selected image
  // TODO: Call onUpload with selected file

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }

  return (
    <SectionCard
      title="Upload Receipt"
      description="Take a photo or upload an image of your receipt."
    >
      <div className="flex flex-col items-center gap-4 py-4">
        {isLoading ? (
          <Spinner size="lg" />
        ) : (
          <>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <Button variant="outline" type="button">
                Choose Image
              </Button>
            </label>
            <p className="text-sm text-muted-foreground">or drag and drop here</p>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </SectionCard>
  );
}
