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
