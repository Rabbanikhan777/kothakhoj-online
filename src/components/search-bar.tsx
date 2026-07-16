import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NEPAL_CITIES, NEPAL_DISTRICTS, PROPERTY_TYPES } from "@/lib/format";

export function SearchBar({ defaultMode = "buy" }: { defaultMode?: "buy" | "rent" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"buy" | "rent">(defaultMode);
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  return (
    <div className="rounded-2xl bg-background/95 p-3 shadow-elegant ring-1 ring-border backdrop-blur">
      <div className="flex gap-2 pb-3">
        <button
          onClick={() => setMode("buy")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "buy" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("rent")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "rent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
        >
          Rent
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            {NEPAL_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            {NEPAL_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="Max price (Rs)"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <Button
          className="bg-gradient-hero text-primary-foreground shadow-soft"
          onClick={() => {
            const search: Record<string, string> = {};
            if (city) search.city = city;
            if (district) search.district = district;
            if (type) search.type = type;
            if (maxPrice) search.maxPrice = maxPrice;
            navigate({ to: mode === "buy" ? "/buy" : "/rent", search });
          }}
        >
          <Search className="mr-1 h-4 w-4" /> Search
        </Button>
      </div>
    </div>
  );
}
