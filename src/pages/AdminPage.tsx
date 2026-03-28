import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, UserPlus, Trash2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole, type AppRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OfficialProfile {
  user_id: string;
  display_name: string;
  email?: string;
  constituency: string | null;
  region: string | null;
  title: string | null;
  roles: AppRole[];
}

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "mp", label: "Member of Parliament" },
  { value: "minister", label: "Minister" },
  { value: "dce", label: "District Chief Executive" },
  { value: "president", label: "President" },
  { value: "admin", label: "Administrator" },
];

const AdminPage = () => {
  const { user } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const [officials, setOfficials] = useState<OfficialProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<AppRole>("mp");
  const [addTitle, setAddTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchOfficials = async () => {
    setLoading(true);
    // Get all non-citizen roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .neq("role", "citizen");

    if (!roles || roles.length === 0) {
      setOfficials([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(roles.map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, constituency, region, title")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const roleMap = new Map<string, AppRole[]>();
    roles.forEach((r) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role as AppRole);
      roleMap.set(r.user_id, existing);
    });

    const result: OfficialProfile[] = userIds.map((uid) => {
      const p = profileMap.get(uid);
      return {
        user_id: uid,
        display_name: p?.display_name || "Unknown",
        constituency: p?.constituency || null,
        region: p?.region || null,
        title: p?.title || null,
        roles: roleMap.get(uid) || [],
      };
    });

    setOfficials(result);
    setLoading(false);
  };

  useEffect(() => {
    if (roleData?.isAdmin) fetchOfficials();
  }, [roleData?.isAdmin]);

  const handleAddOfficial = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);

    // Find user by looking up profiles (we don't have direct access to auth.users)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .ilike("display_name", `%${addEmail.trim()}%`);

    if (!profiles || profiles.length === 0) {
      toast.error("No user found with that name. The user must sign up first.");
      setAdding(false);
      return;
    }

    const targetUser = profiles[0];

    // Check if role already exists
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", targetUser.user_id)
      .eq("role", addRole)
      .maybeSingle();

    if (existing) {
      toast.error("User already has this role");
      setAdding(false);
      return;
    }

    // Add role
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: targetUser.user_id, role: addRole });

    if (error) {
      toast.error(error.message);
      setAdding(false);
      return;
    }

    // Update profile title if provided
    if (addTitle.trim()) {
      await supabase
        .from("profiles")
        .update({ title: addTitle.trim() })
        .eq("user_id", targetUser.user_id);
    }

    toast.success(`${targetUser.display_name} assigned as ${addRole.toUpperCase()}`);
    setAddEmail("");
    setAddTitle("");
    setAddOpen(false);
    setAdding(false);
    fetchOfficials();
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Role removed");
    fetchOfficials();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!roleData?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-destructive/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Only administrators can access this panel.</p>
          <Button asChild variant="outline"><Link to="/feed">Back to Feed</Link></Button>
        </div>
      </div>
    );
  }

  const filtered = officials.filter((o) =>
    o.display_name.toLowerCase().includes(search.toLowerCase()) ||
    o.constituency?.toLowerCase().includes(search.toLowerCase()) ||
    o.roles.some((r) => r.includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-1">Manage officials, assign roles, and oversee the platform</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Officials", value: officials.length, icon: Users },
            { label: "MPs", value: officials.filter((o) => o.roles.includes("mp")).length, icon: Users },
            { label: "Ministers", value: officials.filter((o) => o.roles.includes("minister")).length, icon: Users },
            { label: "DCEs", value: officials.filter((o) => o.roles.includes("dce")).length, icon: Users },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <stat.icon className="w-4 h-4 text-primary mb-1" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search officials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add Official</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Official Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>User Display Name</Label>
                  <Input
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="Search by display name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">The user must have signed up first</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={addRole} onValueChange={(v) => setAddRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Official Title (optional)</Label>
                  <Input
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="e.g. MP for Kumasi Central"
                  />
                </div>
                <Button className="w-full" onClick={handleAddOfficial} disabled={adding}>
                  {adding ? "Assigning..." : "Assign Role"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Officials Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading officials...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No officials found. Add one to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role(s)</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Constituency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((official) => (
                    <TableRow key={official.user_id}>
                      <TableCell className="font-medium">{official.display_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {official.roles.map((role) => (
                            <Badge key={role} className="bg-primary text-primary-foreground text-xs">
                              {role.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{official.title || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{official.constituency || "National"}</TableCell>
                      <TableCell className="text-right">
                        {official.roles.map((role) => (
                          <Button
                            key={role}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive gap-1"
                            onClick={() => handleRemoveRole(official.user_id, role)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {role}
                          </Button>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminPage;
