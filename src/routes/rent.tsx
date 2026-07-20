import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ListingsPage } from "./buy";

const searchSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  type: z.string().optional(),
  maxPrice: z.string().optional(),
});

export const Route = createFileRoute("/rent")({
  head: () => ({ meta: [
    { title: "Rent Properties in Nepal — Apartments, Rooms & Homes | KothaKhoj.com" },
    { name: "description", content: "Find apartments, rooms, flats and family homes for rent across Kathmandu, Lalitpur, Pokhara and other Nepali cities. Filter by price, location and property type on KothaKhoj." },
    { property: "og:title", content: "Rent Properties in Nepal — KothaKhoj.com" },
    { property: "og:description", content: "Browse verified rental listings across Nepal — apartments, rooms and family homes at every budget." },
    { property: "og:url", content: "https://nepal-home-hub.lovable.app/rent" },
  ], links: [{ rel: "canonical", href: "https://nepal-home-hub.lovable.app/rent" }] }),
  validateSearch: searchSchema,
  component: RentPage,
});

function RentPage() {
  const search = Route.useSearch();
  return <ListingsPage listing="rent" search={search} title="Rent Properties" />;
}
