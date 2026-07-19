import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/property-card";
import { SearchBar } from "@/components/search-bar";

const searchSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  type: z.string().optional(),
  maxPrice: z.string().optional(),
});

export const Route = createFileRoute("/buy")({
  head: () => ({ meta: [{ title: "Buy Properties in Nepal — KothaKhoj.com" }, { name: "description", content: "Browse homes, apartments, land and villas for sale across Nepal." }] }),
  validateSearch: searchSchema,
  component: BuyPage,
});

function BuyPage() {
  const search = Route.useSearch();
  return <ListingsPage listing="sale" search={search} title="Buy Properties" />;
}

export function ListingsPage({ listing, search, title }: { listing: "sale" | "rent"; search: z.infer<typeof searchSchema>; title: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["properties", listing, search],
    queryFn: async () => {
      let q = supabase
        .from("properties_public")
        .select("id,title,city,district,price,listing_type,property_type,bedrooms,bathrooms,area_sqft,image_url,featured,status")
        .eq("listing_type", listing)
        .in("status", ["active", "rented", "sold", "unavailable"])
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (search.city) q = q.eq("city", search.city);
      if (search.district) q = q.eq("district", search.district);
      if (search.type) q = q.eq("property_type", search.type as never);
      if (search.maxPrice) q = q.lte("price", Number(search.maxPrice));
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Property[];
    },
  });

  return (
    <div>
      <section className="bg-gradient-hero py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-primary-foreground/80">Refine by city, district, type and price.</p>
          <div className="mt-6">
            <SearchBar defaultMode={listing === "sale" ? "buy" : "rent"} />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${data.length} ${data.length === 1 ? "property" : "properties"} found`}
        </p>
        {data.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No properties match your filters. Try broadening the search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
