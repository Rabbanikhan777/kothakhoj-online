import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useNavigate } from "@tanstack/react-router";

export function FavoriteButton({ propertyId, className = "" }: { propertyId: string; className?: string }) {
  const { isFavorite, toggle, signedIn } = useFavorites();
  const navigate = useNavigate();
  const fav = isFavorite(propertyId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!signedIn) return navigate({ to: "/auth" });
        toggle(propertyId);
      }}
      aria-label={fav ? "Remove from favorites" : "Save to favorites"}
      className={`grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-soft ring-1 ring-border transition hover:scale-110 ${className}`}
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-rose-500 text-rose-500" : "text-foreground/70"}`} />
    </button>
  );
}
