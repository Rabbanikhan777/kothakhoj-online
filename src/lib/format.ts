export function formatNPR(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "—";
  if (num >= 10000000) return `Rs ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `Rs ${(num / 100000).toFixed(2)} Lakh`;
  return `Rs ${num.toLocaleString("en-IN")}`;
}

export const NEPAL_CITIES = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Bharatpur",
  "Biratnagar", "Butwal", "Dharan", "Nepalgunj", "Dhulikhel",
  "Nagarkot", "Hetauda", "Janakpur",
];

export const NEPAL_DISTRICTS = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Kaski", "Chitwan",
  "Morang", "Rupandehi", "Sunsari", "Banke", "Kavre",
  "Makwanpur", "Dhanusa",
];

export const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "room", label: "Room" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "sold", label: "Sold" },
  { value: "unavailable", label: "Unavailable" },
] as const;

export type PropertyStatus = "active" | "pending" | "sold" | "rented" | "unavailable" | "draft";

export function statusLabel(s?: string | null): string {
  const found = STATUS_OPTIONS.find((o) => o.value === s);
  if (found) return found.label;
  if (s === "pending") return "Pending";
  if (s === "draft") return "Draft";
  return "Available";
}

export function isAvailable(s?: string | null): boolean {
  return s === "active" || s === "pending" || s == null;
}

export function statusBadgeClass(s?: string | null): string {
  switch (s) {
    case "active": return "bg-emerald-600 text-white";
    case "rented": return "bg-amber-600 text-white";
    case "sold": return "bg-rose-600 text-white";
    case "unavailable": return "bg-slate-500 text-white";
    default: return "bg-slate-500 text-white";
  }
}
