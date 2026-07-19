import { Link } from "@tanstack/react-router";
import { Bed, Bath, MapPin, Maximize2 } from "lucide-react";
import { formatNPR, statusLabel, statusBadgeClass, isAvailable } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export interface Property {
  id: string;
  title: string;
  city: string;
  district: string;
  price: number | string;
  listing_type: "sale" | "rent";
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | string | null;
  image_url: string | null;
  featured?: boolean;
}

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link
      to="/properties/$id"
      params={{ id: p.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground capitalize">
            For {p.listing_type}
          </Badge>
          {p.featured && <Badge className="bg-brand-navy text-primary-foreground">Featured</Badge>}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-primary">
            {formatNPR(p.price)}
            {p.listing_type === "rent" && <span className="text-xs text-muted-foreground">/mo</span>}
          </span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{p.property_type}</span>
        </div>
        <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold text-foreground">{p.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {p.city}, {p.district}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          {!!p.bedrooms && <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {p.bedrooms}</span>}
          {!!p.bathrooms && <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {p.bathrooms}</span>}
          {!!p.area_sqft && <span className="flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {p.area_sqft} sqft</span>}
        </div>
      </div>
    </Link>
  );
}
