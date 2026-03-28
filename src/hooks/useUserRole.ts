import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "citizen" | "mp" | "minister" | "dce" | "president" | "admin";

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      const roles = (data || []).map((r) => r.role as AppRole);
      return {
        roles,
        isOfficial: roles.some((r) => ["mp", "minister", "dce", "president", "admin"].includes(r)),
        isMP: roles.includes("mp"),
        isMinister: roles.includes("minister"),
        isDCE: roles.includes("dce"),
        isPresident: roles.includes("president"),
        isAdmin: roles.includes("admin"),
      };
    },
    enabled: !!user,
  });
};
