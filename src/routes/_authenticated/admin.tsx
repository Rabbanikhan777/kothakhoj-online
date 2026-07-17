import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatNPR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — KothaKhoj.com" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", (context as any).user.id).eq("role", "admin");
    if (!data || data.length === 0) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function toggleFeatured(id: string, featured: boolean) {
    const { error } = await supabase.from("properties").update({ featured: !featured }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-properties"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-properties"] });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
      <p className="text-muted-foreground">Manage all listings and users on KothaKhoj.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total listings" value={properties.length} />
        <Stat label="Active" value={properties.filter((p) => p.status === "active").length} />
        <Stat label="Registered users" value={profiles.length} />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">All properties</h2>
      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">City</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Featured</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-medium">
                    <Link to="/properties/$id" params={{ id: p.id }} className="hover:text-primary">{p.title}</Link>
                  </td>
                  <td className="p-3 capitalize">{p.property_type} · {p.listing_type}</td>
                  <td className="p-3">{p.city}</td>
                  <td className="p-3">{formatNPR(p.price)}</td>
                  <td className="p-3"><Badge variant="outline" className="capitalize">{p.status}</Badge></td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => toggleFeatured(p.id, !!p.featured)}>
                      <Star className={`h-4 w-4 ${p.featured ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </Button>
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 font-display text-xl font-semibold">Users</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">{u.full_name || "—"}</td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-gradient-card p-6 shadow-soft">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold text-primary">{value}</div>
    </div>
  );
}
