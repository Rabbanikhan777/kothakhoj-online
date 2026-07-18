import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatNPR } from "@/lib/format";
import { Bed, Bath, MapPin, Maximize2, Phone, User, ArrowLeft, Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/properties/$id")({
  component: PropertyDetail,
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties_public").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: contact } = useQuery({
    queryKey: ["property-contact", id, user?.id],
    enabled: !!user && !!property,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("contact_name,contact_phone").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return data ?? [];
    },
  });
  const canEdit = !!user && !!property && (property.owner_id === user.id || roles.some((r) => r.role === "admin"));
  const contactName = contact?.contact_name ?? null;
  const contactPhone = contact?.contact_phone ?? null;

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  if (error || !property) return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Property not found.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/buy" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-muted shadow-elegant">
            {property.image_url ? (
              <img src={property.image_url} alt={property.title ?? "Property"} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="grid aspect-[16/10] place-items-center text-muted-foreground">No image</div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground capitalize">For {property.listing_type}</Badge>
            <Badge variant="outline" className="capitalize">{property.property_type}</Badge>
            {property.featured && <Badge className="bg-brand-navy text-primary-foreground">Featured</Badge>}
            {canEdit && (
              <Button asChild size="sm" variant="outline" className="ml-auto">
                <Link to="/edit-property/$id" params={{ id }}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Link>
              </Button>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{property.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {property.address || `${property.city}, ${property.district}`}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-gradient-card p-4">
            <Stat icon={Bed} label="Bedrooms" value={property.bedrooms ?? "—"} />
            <Stat icon={Bath} label="Bathrooms" value={property.bathrooms ?? "—"} />
            <Stat icon={Maximize2} label="Area" value={property.area_sqft ? `${property.area_sqft} sqft` : "—"} />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/85">
              {property.description || "No description provided."}
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-gradient-card p-6 shadow-elegant">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="mt-1 font-display text-3xl font-bold text-primary">
              {formatNPR(property.price)}
              {property.listing_type === "rent" && <span className="text-base text-muted-foreground">/month</span>}
            </div>
            <div className="mt-6 space-y-3 border-t pt-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" /> {property.contact_name || "Owner"}
              </div>
              {property.contact_phone && (
                <a href={`tel:${property.contact_phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="h-4 w-4" /> {property.contact_phone}
                </a>
              )}
            </div>
            <Button className="mt-6 w-full bg-gradient-hero text-primary-foreground" size="lg" asChild>
              <a href={property.contact_phone ? `tel:${property.contact_phone}` : "/contact"}>Contact Owner</a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4 text-primary" /> Property type
            </div>
            <p className="mt-1 text-sm capitalize text-muted-foreground">{property.property_type}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-background p-3 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
