import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NEPAL_CITIES, NEPAL_DISTRICTS, PROPERTY_TYPES } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/add-property")({
  head: () => ({ meta: [{ title: "Add Property — KothaKhoj.com" }] }),
  component: AddProperty,
});

function AddProperty() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    listing_type: "sale",
    property_type: "house",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    city: "Kathmandu",
    district: "Kathmandu",
    address: "",
    image_url: "",
    contact_name: "",
    contact_phone: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase.from("properties").insert({
      owner_id: user.id,
      title: form.title,
      description: form.description,
      listing_type: form.listing_type as any,
      property_type: form.property_type as any,
      price: Number(form.price),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      city: form.city,
      district: form.district,
      address: form.address || null,
      image_url: form.image_url || null,
      contact_name: form.contact_name || null,
      contact_phone: form.contact_phone || null,
      status: "active",
    }).select("id").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Property listed!");
    navigate({ to: "/properties/$id", params: { id: data.id } });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">List a new property</h1>
      <p className="mt-1 text-muted-foreground">Add details below. Your listing goes live instantly.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl bg-gradient-card p-6 shadow-soft">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. Modern 3BHK Apartment in Baneshwor" />
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Price (Rs)</Label>
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
          <Label>Image URL</Label>
          <Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" />
          {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-40 w-full rounded-lg object-cover" />}
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

        <Button type="submit" size="lg" className="w-full bg-gradient-hero text-primary-foreground" disabled={saving}>
          {saving ? "Publishing…" : "Publish listing"}
        </Button>
      </form>
    </div>
  );
}
