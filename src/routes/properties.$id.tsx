import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatNPR, statusLabel, statusBadgeClass, isAvailable } from "@/lib/format";
import { Bed, Bath, MapPin, Maximize2, Phone, User, ArrowLeft, Building2, Pencil, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorite-button";

export const Route = createFileRoute("/properties/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("properties_public")
      .select("title,description,city,district,listing_type,property_type,price,image_url")
      .eq("id", params.id)
      .maybeSingle();
    return { seo: data };
  },
  head: ({ params, loaderData }) => {
    const url = `https://nepal-home-hub.lovable.app/properties/${params.id}`;
    const p = loaderData?.seo;
    if (!p) {
      return {
        meta: [
          { title: "Property — KothaKhoj.com" },
          { name: "description", content: "View property details, photos, price, and contact information on KothaKhoj — Nepal's real estate marketplace." },
          { name: "robots", content: "noindex" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const action = p.listing_type === "rent" ? "for Rent" : "for Sale";
    const title = `${p.title} — ${p.city}, ${p.district} ${action} | KothaKhoj.com`;
    const desc = `${p.property_type} ${action.toLowerCase()} in ${p.city}, ${p.district}, Nepal. Priced at NPR ${Number(p.price).toLocaleString("en-IN")}. View photos, details, and contact the owner on KothaKhoj.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
    ];
    if (p.image_url) {
      meta.push({ property: "og:image", content: p.image_url });
      meta.push({ name: "twitter:image", content: p.image_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.title,
            description: p.description ?? desc,
            image: p.image_url ? [p.image_url] : undefined,
            category: `Real Estate — ${p.property_type} ${action}`,
            url,
            offers: {
              "@type": "Offer",
              price: Number(p.price),
              priceCurrency: "NPR",
              availability: "https://schema.org/InStock",
              url,
            },
            areaServed: { "@type": "Place", name: `${p.city}, ${p.district}, Nepal` },
          }),
        },
      ],
    };
  },
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
  const gallery: string[] = property && Array.isArray((property as any).images) && (property as any).images.length
    ? (property as any).images
    : property?.image_url ? [property.image_url] : [];
  const [activeIdx, setActiveIdx] = useState(0);

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  if (error || !property) return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Property not found.</div>;

  const active = gallery[activeIdx] ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/buy" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-muted shadow-elegant">
            {active ? (
              <img src={active} alt={property.title ?? "Property"} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="grid aspect-[16/10] place-items-center text-muted-foreground">No image</div>
            )}
            <div className="absolute right-3 top-3">
              <FavoriteButton propertyId={property.id as string} />
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${i === activeIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground capitalize">For {property.listing_type}</Badge>
            <Badge variant="outline" className="capitalize">{property.property_type}</Badge>
            <Badge className={statusBadgeClass(property.status)}>{statusLabel(property.status)}</Badge>
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
            {isAvailable(property.status) ? (
              <>
                <div className="mt-6 space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" /> {contactName || "Owner"}
                  </div>
                  {contactPhone ? (
                    <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Phone className="h-4 w-4" /> {contactPhone}
                    </a>
                  ) : !user ? (
                    <p className="text-xs text-muted-foreground">
                      <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to view contact details.
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <Button className="w-full bg-gradient-hero text-primary-foreground" size="lg" asChild>
                    {contactPhone ? (
                      <a href={`tel:${contactPhone}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
                    ) : (
                      <Link to={user ? "/contact" : "/auth"}><Phone className="mr-2 h-4 w-4" /> Call</Link>
                    )}
                  </Button>
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" size="lg" asChild>
                    {contactPhone ? (
                      <a
                        href={`https://wa.me/${contactPhone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${property.title}" on KothaKhoj.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                      </a>
                    ) : (
                      <Link to={user ? "/contact" : "/auth"}><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Link>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-6 border-t pt-4">
                <div className={`rounded-xl p-4 text-center ${statusBadgeClass(property.status)}`}>
                  <div className="text-sm opacity-90">This property is</div>
                  <div className="mt-1 font-display text-xl font-bold">{statusLabel(property.status)}</div>
                </div>
                <Button className="mt-4 w-full" size="lg" variant="outline" disabled>
                  Not available for contact
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Browse other listings that are currently available.
                </p>
              </div>
            )}
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
