import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isUuid } from "@/lib/isUuid";

export type ProjectStatus =
  | "proposed"
  | "under_review"
  | "approved"
  | "in_progress"
  | "completed"
  | "rejected";

export type DbProject = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  constituency: string;
  region: string;
  district: string;
  estimated_impact: string | null;
  status: ProjectStatus;
  vote_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  has_voted?: boolean;
};

export const useProjects = (
  sort: "top" | "newest" | "constituency" = "top",
  category?: string | null,
  constituency?: string | null
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects", sort, category, constituency, user?.id],
    queryFn: async () => {
      let query = supabase.from("project_suggestions").select("*");

      if (category) query = query.eq("category", category);
      if (constituency) query = query.eq("constituency", constituency);

      if (sort === "top") {
        query = query.order("vote_count", { ascending: false });
      } else if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query
          .order("constituency", { ascending: true })
          .order("vote_count", { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const nameMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.display_name])
      );

      let votedSet = new Set<string>();
      if (user) {
        const projectIds = (data || []).map((d) => d.id);
        if (projectIds.length > 0) {
          const { data: votes } = await supabase
            .from("project_votes")
            .select("project_id")
            .eq("user_id", user.id)
            .in("project_id", projectIds);
          votedSet = new Set((votes || []).map((v) => v.project_id));
        }
      }

      return (data || []).map(
        (d): DbProject => ({
          ...d,
          status: d.status as ProjectStatus,
          author_name: nameMap.get(d.user_id) || "Anonymous",
          has_voted: votedSet.has(d.id),
        })
      );
    },
  });
};

export const useProject = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["project", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_suggestions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.user_id)
        .single();

      let hasVoted = false;
      if (user) {
        const { data: vote } = await supabase
          .from("project_votes")
          .select("id")
          .eq("user_id", user.id)
          .eq("project_id", id)
          .maybeSingle();
        hasVoted = !!vote;
      }

      return {
        ...data,
        status: data.status as ProjectStatus,
        author_name: profile?.display_name || "Anonymous",
        has_voted: hasVoted,
      } as DbProject;
    },
    enabled: !!id && isUuid(id),
  });
};

export const useProjectVote = () => {
  const qc = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      projectConstituency,
    }: {
      projectId: string;
      projectConstituency: string;
    }) => {
      if (!user) throw new Error("Please sign in to vote");
      if (!profile?.constituency)
        throw new Error("Set your constituency in your profile before voting");
      if (profile.constituency !== projectConstituency)
        throw new Error(
          "You can only vote on projects in your own constituency"
        );
      if (!isUuid(projectId))
        throw new Error("Cannot vote on sample projects");

      const { data: existing } = await supabase
        .from("project_votes")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        await supabase.from("project_votes").delete().eq("id", existing.id);
        const { count } = await supabase
          .from("project_votes")
          .select("id", { count: "exact" })
          .eq("project_id", projectId);
        await supabase
          .from("project_suggestions")
          .update({ vote_count: count || 0 })
          .eq("id", projectId);
        return "removed" as const;
      }

      await supabase
        .from("project_votes")
        .insert({ user_id: user.id, project_id: projectId });
      const { count } = await supabase
        .from("project_votes")
        .select("id", { count: "exact" })
        .eq("project_id", projectId);
      await supabase
        .from("project_suggestions")
        .update({ vote_count: count || 0 })
        .eq("id", projectId);
      return "added" as const;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project"] });
      toast.success(result === "added" ? "Vote recorded" : "Vote removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: {
      title: string;
      description: string;
      category: string;
      constituency: string;
      region: string;
      district: string;
      estimated_impact?: string;
    }) => {
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase
        .from("project_suggestions")
        .insert({ ...project, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project suggestion submitted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
