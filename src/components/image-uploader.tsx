import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPropertyImages } from "@/lib/storage";
import { toast } from "sonner";

export function ImageUploader({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, 10);
    setUploading(true);
    try {
      const urls = await uploadPropertyImages(list, userId);
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
        ) : (
          <><Camera className="mr-2 h-4 w-4" /> Upload from gallery / camera</>
        )}
      </Button>
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Up to 10 photos. First image becomes the cover.
      </p>
    </div>
  );
}
