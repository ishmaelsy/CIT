import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useLeaderRatings = (leaderUserId: string) => {
  return useQuery({
    queryKey: ["leader-ratings", leaderUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leader_ratings")
        .select("*")
        .eq("leader_user_id", leaderUserId);
      if (error) throw error;

      const ratings = data || [];
      const avg = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        ratings,
        averageRating: +avg.toFixed(1),
        totalRatings: ratings.length,
      };
    },
    enabled: !!leaderUserId,
  });
};

export const useSubmitRating = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      leaderUserId,
      rating,
      review,
    }: {
      leaderUserId: string;
      rating: number;
      review?: string;
    }) => {
      if (!user) throw new Error("Please sign in to rate");
      const monthYear = new Date().toISOString().slice(0, 7); // "2026-03"

      // Check if already rated this month
      const { data: existing } = await supabase
        .from("leader_ratings")
        .select("id")
        .eq("user_id", user.id)
        .eq("leader_user_id", leaderUserId)
        .eq("month_year", monthYear)
        .maybeSingle();

      if (existing) {
        throw new Error("You already rated this leader this month");
      }

      const { error } = await supabase.from("leader_ratings").insert({
        user_id: user.id,
        leader_user_id: leaderUserId,
        rating,
        review: review || null,
        month_year: monthYear,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["leader-ratings", vars.leaderUserId] });
      toast.success("Rating submitted!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
