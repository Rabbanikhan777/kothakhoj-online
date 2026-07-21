import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/property-card";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites — KothaKhoj.com" },
      { name: "description", content: "Your saved properties on KothaKhoj — Nepal's modern real estate marketplace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = Route.useRouteContext();

  const { data: ids = [] } = useQuery({
    queryKey: ["favorites", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("favorites" as never).select("property_id").eq("user_id" as never, user.id);
      return (data ?? []).map((r: any) => r.property_id as string);
    },
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["favorite-properties", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("properties_public")
        .select("id,title,city,district,price,listing_type,property_type,bedrooms,bathrooms,area_sqft,image_url,featured,status")
        .in("id", ids);
      return (data ?? []) as Property[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-500">
          <Heart className="h-5 w-5 fill-rose-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">My favorites</h1>
          <p className="text-sm text-muted-foreground">Properties you've saved</p>
        </div>
      </div>

      {ids.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">You haven't saved any properties yet.</p>
          <Button asChild className="mt-4 bg-gradient-hero text-primary-foreground">
            <Link to="/buy">Browse properties</Link>
          </Button>
        </div>
      ) : isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
