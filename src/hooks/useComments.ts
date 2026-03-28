import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isUuid } from "@/lib/isUuid";

export interface Comment {
  id: string;
  user_id: string;
  issue_id: string;
  parent_id: string | null;
  content: string;
  is_official: boolean;
  created_at: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  replies?: Comment[];
}

export const useComments = (issueId: string) => {
  return useQuery({
    queryKey: ["comments", issueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for comment authors
      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      // Fetch roles for authors
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("user_id", userIds);
      const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));

      const flat = (data || []).map((c: any) => {
        const prof = profileMap.get(c.user_id);
        const role = roleMap.get(c.user_id);
        return {
          id: c.id,
          user_id: c.user_id,
          issue_id: c.issue_id,
          parent_id: c.parent_id,
          content: c.content,
          is_official: c.is_official || (role && role !== "citizen"),
          created_at: c.created_at,
          author_name: prof?.display_name || "Anonymous",
          author_avatar: prof?.avatar_url,
          author_role: role || "citizen",
        };
      });

      // Build thread tree
      const roots: Comment[] = [];
      const map = new Map<string, Comment>();
      flat.forEach((c: Comment) => { map.set(c.id, { ...c, replies: [] }); });
      flat.forEach((c: Comment) => {
        const node = map.get(c.id)!;
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(node);
        } else {
          roots.push(node);
        }
      });
      return roots;
    },
    enabled: !!issueId && isUuid(issueId),
  });
};

export const useAddComment = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      issueId,
      content,
      parentId,
    }: {
      issueId: string;
      content: string;
      parentId?: string;
    }) => {
      if (!user) throw new Error("Please sign in to comment");
      if (!isUuid(issueId)) throw new Error("Cannot comment on sample issues");

      // Check if user is an official
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isOfficial = (roles || []).some((r) => r.role !== "citizen");

      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        issue_id: issueId,
        content,
        parent_id: parentId || null,
        is_official: isOfficial,
      });
      if (error) throw error;

      // Update comment count
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact" })
        .eq("issue_id", issueId);
      await supabase.from("issues").update({ comments_count: count || 0 }).eq("id", issueId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.issueId] });
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["issue"] });
      toast.success("Comment posted!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
