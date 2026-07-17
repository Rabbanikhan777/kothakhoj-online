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
  head: () => ({ meta: [{ title: "Rent Properties in Nepal — KothaKhoj.com" }, { name: "description", content: "Rent apartments, rooms and homes across Nepal." }] }),
  validateSearch: searchSchema,
  component: RentPage,
});

function RentPage() {
  const search = Route.useSearch();
  return <ListingsPage listing="rent" search={search} title="Rent Properties" />;
}
