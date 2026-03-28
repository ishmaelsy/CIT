import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isUuid } from "@/lib/isUuid";

export type DbIssue = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  constituency: string;
  region: string;
  district: string;
  urgency: string;
  status: string;
  image_urls: string[] | null;
  upvotes_count: number;
  me_too_count: number;
  comments_count: number;
  magnitude_score: number;
  has_official_response: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
};

export const useIssues = (sort: string = "trending", category?: string | null) => {
  return useQuery({
    queryKey: ["issues", sort, category],
    queryFn: async () => {
      let query = supabase.from("issues").select("*");

      if (category) query = query.eq("category", category);

      if (sort === "trending") query = query.order("magnitude_score", { ascending: false });
      else if (sort === "urgent") query = query.order("urgency", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Fetch author names
      const userIds = [...new Set((data || []).map((d) => d.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      const nameMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name]));

      return (data || []).map((d) => ({
        ...d,
        author_name: nameMap.get(d.user_id) || "Anonymous",
      }));
    },
  });
};

export const useIssue = (id: string) => {
  return useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.user_id)
        .single();

      return { ...data, author_name: profile?.display_name || "Anonymous" };
    },
    enabled: !!id && isUuid(id),
  });
};

export const useUpvote = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (issueId: string) => {
      if (!user) throw new Error("Please sign in to upvote");
      if (!isUuid(issueId)) throw new Error("Cannot upvote sample issues — report a real one!");
      // Check if already upvoted
      const { data: existing } = await supabase
        .from("upvotes")
        .select("id")
        .eq("user_id", user.id)
        .eq("issue_id", issueId)
        .maybeSingle();

      if (existing) {
        await supabase.from("upvotes").delete().eq("id", existing.id);
        await supabase.from("issues").update({
          upvotes_count: (await supabase.from("upvotes").select("id", { count: "exact" }).eq("issue_id", issueId)).count || 0,
        }).eq("id", issueId);
        return "removed";
      } else {
        await supabase.from("upvotes").insert({ user_id: user.id, issue_id: issueId });
        await supabase.from("issues").update({
          upvotes_count: (await supabase.from("upvotes").select("id", { count: "exact" }).eq("issue_id", issueId)).count || 0,
        }).eq("id", issueId);
        return "added";
      }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["issue"] });
      toast.success(result === "added" ? "Upvoted!" : "Upvote removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useMeToo = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (issueId: string) => {
      if (!user) throw new Error("Please sign in to report");
      if (!isUuid(issueId)) throw new Error("Cannot report sample issues — report a real one!");
      const { data: existing } = await supabase
        .from("me_too_reports")
        .select("id")
        .eq("user_id", user.id)
        .eq("issue_id", issueId)
        .maybeSingle();

      if (existing) {
        throw new Error("You already reported this issue");
      }
      await supabase.from("me_too_reports").insert({ user_id: user.id, issue_id: issueId });
      const { count } = await supabase.from("me_too_reports").select("id", { count: "exact" }).eq("issue_id", issueId);
      await supabase.from("issues").update({ me_too_count: count || 0 }).eq("id", issueId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["issue"] });
      toast.success("Me Too reported!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useCreateIssue = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (issue: {
      title: string;
      description: string;
      category: string;
      constituency: string;
      region: string;
      district: string;
      urgency: string;
      image_urls?: string[];
    }) => {
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.from("issues").insert({
        ...issue,
        user_id: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Issue reported successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
