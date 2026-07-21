import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites" as never).select("property_id").eq("user_id" as never, user!.id);
      return (data ?? []).map((r: any) => r.property_id as string);
    },
  });

  const toggle = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("Please sign in to save favorites.");
      const isFav = favoriteIds.includes(propertyId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites" as never)
          .delete()
          .eq("user_id" as never, user.id)
          .eq("property_id" as never, propertyId);
        if (error) throw error;
        return { added: false };
      }
      const { error } = await supabase.from("favorites" as never).insert({ user_id: user.id, property_id: propertyId } as never);
      if (error) throw error;
      return { added: true };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(r.added ? "Saved to favorites" : "Removed from favorites");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return {
    favoriteIds,
    isFavorite: (id: string) => favoriteIds.includes(id),
    toggle: (id: string) => toggle.mutate(id),
    signedIn: !!user,
  };
}
