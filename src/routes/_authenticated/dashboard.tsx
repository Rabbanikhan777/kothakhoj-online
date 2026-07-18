import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatNPR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Home, Shield, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — KothaKhoj.com" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return data ?? [];
    },
  });
  const isAdmin = roles.some((r) => r.role === "admin");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["my-properties", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    qc.invalidateQueries({ queryKey: ["my-properties"] });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild variant="outline"><Link to="/admin"><Shield className="mr-1 h-4 w-4" /> Admin</Link></Button>
          )}
          <Button asChild className="bg-gradient-hero text-primary-foreground">
            <Link to="/add-property"><Plus className="mr-1 h-4 w-4" /> Add property</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="My listings" value={listings.length} />
        <StatCard label="Active" value={listings.filter((l) => l.status === "active").length} />
        <StatCard label="Featured" value={listings.filter((l) => l.featured).length} />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Your properties</h2>
      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
          <Home className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">You haven't listed any properties yet.</p>
          <Button asChild className="mt-4 bg-gradient-hero text-primary-foreground">
            <Link to="/add-property">List your first property</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Location</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="p-3 font-medium">
                    <Link to="/properties/$id" params={{ id: l.id }} className="hover:text-primary">{l.title}</Link>
                  </td>
                  <td className="p-3 capitalize">{l.property_type} · {l.listing_type}</td>
                  <td className="p-3">{l.city}, {l.district}</td>
                  <td className="p-3">{formatNPR(l.price)}</td>
                  <td className="p-3"><Badge variant="outline" className="capitalize">{l.status}</Badge></td>
                  <td className="p-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/edit-property/$id" params={{ id: l.id }}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-gradient-card p-6 shadow-soft">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold text-primary">{value}</div>
    </div>
  );
}
