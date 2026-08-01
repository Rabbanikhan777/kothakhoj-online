import { useRef, useState } from "react";
import { Camera, X, Loader2, UploadCloud } from "lucide-react";
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
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files) return;
    const list = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, 10 - value.length));
    if (list.length === 0) {
      toast.error("Please choose image files (max 10 photos).");
      return;
    }
    const localPreviews = list.map((f) => URL.createObjectURL(f));
    setPreviews(localPreviews);
    setUploading(true);
    try {
      const urls = await uploadPropertyImages(list, userId);
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (e: any) {
      toast.error(e?.message || "Upload failed. Please try again.");
    } finally {
      localPreviews.forEach((u) => URL.revokeObjectURL(u));
      setPreviews([]);
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
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading and optimising…</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-primary" />
            <p className="text-sm font-medium">Drag & drop photos here</p>
            <p className="text-xs text-muted-foreground">or click to pick from your device</p>
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Camera className="mr-2 h-4 w-4" /> Choose photos
      </Button>

      {(value.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={url} alt={`Property photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
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
          {previews.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={url} alt="Uploading preview" className="h-full w-full object-cover opacity-50" />
              <span className="absolute inset-0 grid place-items-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Up to 10 photos. First image becomes the cover. Images are optimised automatically.
      </p>
    </div>
  );
}
