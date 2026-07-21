import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NEPAL_CITIES, NEPAL_DISTRICTS, PROPERTY_TYPES, STATUS_OPTIONS } from "@/lib/format";
import { ImageUploader } from "@/components/image-uploader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/edit-property/$id")({
  head: () => ({ meta: [{ title: "Edit Property — KothaKhoj.com" }, { name: "robots", content: "noindex" }] }),
  component: EditProperty,
});

function EditProperty() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);

  const { data: roles = [] } = useQuery({
    queryKey: ["roles", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return data ?? [];
    },
  });
  const isAdmin = roles.some((r) => r.role === "admin");

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (property && !form) {
      setForm({
        title: property.title ?? "",
        description: property.description ?? "",
        listing_type: property.listing_type ?? "sale",
        property_type: property.property_type ?? "house",
        price: String(property.price ?? ""),
        bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
        bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
        area_sqft: property.area_sqft != null ? String(property.area_sqft) : "",
        city: property.city ?? "Kathmandu",
        district: property.district ?? "Kathmandu",
        address: property.address ?? "",
        contact_name: property.contact_name ?? "",
        contact_phone: property.contact_phone ?? "",
        status: property.status ?? "active",
      });
      const existing = Array.isArray(property.images) ? (property.images as string[]) : [];
      const merged = existing.length ? existing : (property.image_url ? [property.image_url] : []);
      setImages(merged);
    }
  }, [property, form]);

  if (isLoading || !form) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (error || !property) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center">Property not found.</div>;
  }

  const canEdit = isAdmin || property.owner_id === user.id;
  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Not authorized</h1>
        <p className="mt-2 text-muted-foreground">You don't have permission to edit this listing.</p>
      </div>
    );
  }

  function set<K extends string>(k: K, v: string) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("properties").update({
      title: form.title,
      description: form.description,
      listing_type: form.listing_type,
      property_type: form.property_type,
      price: Number(form.price),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      city: form.city,
      district: form.district,
      address: form.address || null,
      image_url: images[0] || null,
      images: images as any,
      contact_name: form.contact_name || null,
      contact_phone: form.contact_phone || null,
      status: form.status as any,
    }).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Listing updated!");
    navigate({ to: "/properties/$id", params: { id } });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Edit property</h1>
      <p className="mt-1 text-muted-foreground">Update the details below and save your changes.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl bg-gradient-card p-6 shadow-soft">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Listing type</Label>
            <Select value={form.listing_type} onValueChange={(v) => set("listing_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Property type</Label>
            <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Availability status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>


        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>{form.listing_type === "rent" ? "Rent (Rs/mo)" : "Price (Rs)"}</Label>
            <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required />
          </div>
          <div>
            <Label>Bedrooms</Label>
            <Input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <Label>Bathrooms</Label>
            <Input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Area (sqft)</Label>
            <Input type="number" min="0" value={form.area_sqft} onChange={(e) => set("area_sqft", e.target.value)} />
          </div>
          <div>
            <Label>City</Label>
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{NEPAL_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>District</Label>
            <Select value={form.district} onValueChange={(v) => set("district", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{NEPAL_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Address (optional)</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, tole, ward" />
        </div>

        <div>
          <Label>Photos</Label>
          <div className="mt-2">
            <ImageUploader userId={user.id} value={images} onChange={setImages} />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Contact name</Label>
            <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
          </div>
          <div>
            <Label>Contact phone</Label>
            <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+977-…" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate({ to: "/properties/$id", params: { id } })}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1 bg-gradient-hero text-primary-foreground" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
