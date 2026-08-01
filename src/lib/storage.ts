import { supabase } from "@/integrations/supabase/client";

const BUCKET = "property-images";
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;
const MAX_BYTES = 15 * 1024 * 1024;

/** Downscale + re-encode an image in the browser while keeping good quality. */
export async function compressImage(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadPropertyImages(files: File[], userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const original of files) {
    if (!original.type.startsWith("image/")) {
      throw new Error(`"${original.name}" is not an image file.`);
    }
    if (original.size > MAX_BYTES) {
      throw new Error(`"${original.name}" is larger than 15MB.`);
    }
    const file = await compressImage(original);
    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) {
      throw new Error(error.message || "Could not upload image. Please try again.");
    }
    const { data, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signErr) throw new Error(signErr.message || "Could not generate image link.");
    urls.push(data.signedUrl);
  }


  return urls;
}
