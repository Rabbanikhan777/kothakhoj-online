import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/search-bar";
import { PropertyCard, type Property } from "@/components/property-card";
import { Building2, Home, TrendingUp, Shield, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: properties = [] } = useQuery({
    queryKey: ["properties", "all-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,city,district,price,listing_type,property_type,bedrooms,bathrooms,area_sqft,image_url,featured")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Property[];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium ring-1 ring-primary-foreground/20">
              <MapPin className="h-3 w-3" /> Serving Kathmandu, Pokhara, Lalitpur & beyond
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-6xl">
              Find your next <span className="text-primary-foreground/90 underline decoration-primary-foreground/40">home in Nepal</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
              KothaKhoj.com is Nepal's modern property marketplace. Search verified listings, connect directly with owners, and move in with confidence.
            </p>
          </div>
          <div className="mt-8">
            <SearchBar />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/buy">Browse Properties <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/sell">List Your Property</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { n: "10K+", l: "Listings" },
            { n: "50+", l: "Cities" },
            { n: "5K+", l: "Happy families" },
            { n: "24/7", l: "Support" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-3xl font-bold text-primary">{s.n}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Latest properties</h2>
            <p className="mt-1 text-muted-foreground">All active listings across Nepal</p>
          </div>
          <Link to="/buy" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-accent/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold">Why KothaKhoj?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, t: "Verified listings", d: "Every listing is reviewed for accuracy before it goes live." },
              { icon: TrendingUp, t: "Best market prices", d: "Compare prices across localities and property types." },
              { icon: Building2, t: "Direct with owners", d: "No middlemen. Chat and negotiate with owners directly." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl bg-gradient-card p-6 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant sm:p-14">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold">Ready to list your property?</h2>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                Reach thousands of buyers and renters across Nepal. It's free to list on KothaKhoj.
              </p>
            </div>
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/sell"><Home className="mr-1 h-4 w-4" /> Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
