const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB raw file limit before compression
const TARGET_MAX_BYTES = 2 * 1024 * 1024; // aim under this after compression
const MAX_DIMENSION = 2400; // higher resolution helps OCR read small prices

/** Resize and compress an image in the browser before upload. */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (JPEG, PNG, or WebP).");
  }

  // HEIC/HEIF often fails in canvas — ask user to convert
  if (file.type === "image/heic" || file.type === "image/heif") {
    throw new Error(
      "HEIC photos are not supported. Please use JPEG or PNG, or take a screenshot of the receipt.",
    );
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.92;
  let blob = await canvasToJpegBlob(canvas, quality);

  while (blob.size > TARGET_MAX_BYTES && quality > 0.65) {
    quality -= 0.1;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      "Image is still too large after compression. Try a smaller photo or screenshot.",
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "receipt";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality,
    );
  });
}
