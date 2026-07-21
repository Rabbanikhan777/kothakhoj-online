import { supabase } from "@/integrations/supabase/client";

const BUCKET = "property-images";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function uploadPropertyImages(files: File[], userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, ONE_YEAR);
    if (signErr) throw signErr;
    urls.push(data.signedUrl);
  }
  return urls;
}
