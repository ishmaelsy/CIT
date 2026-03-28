import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, ThumbsUp, MessageCircle, MapPin, Settings, LogOut, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { regions } from "@/data/sampleData";
import {
  SUPPORTED_LANGUAGES,
  getDefaultLanguageForRegion,
  isKhayaConfigured,
  type KhayaLangCode,
} from "@/lib/khaya";
import { Languages } from "lucide-react";

const sampleDistricts: Record<string, string[]> = {
  Ashanti: ["Kumasi Metropolitan", "Obuasi Municipal", "Ejisu Municipal"],
  "Greater Accra": ["Accra Metropolitan", "Tema Metropolitan", "Ga South Municipal"],
  Northern: ["Tamale Metropolitan", "Sagnarigu Municipal", "Yendi Municipal"],
  Western: ["Sekondi-Takoradi Metropolitan", "Tarkwa-Nsuaem Municipal"],
  Bono: ["Sunyani Municipal", "Dormaa Municipal"],
  Eastern: ["Koforidua Municipal", "Nsawam-Adoagyiri"],
  Central: ["Cape Coast Metropolitan", "Mfantseman Municipal"],
  Volta: ["Ho Municipal", "Keta Municipal"],
  "Upper East": ["Bolgatanga Municipal", "Bawku Municipal"],
  "Upper West": ["Wa Municipal", "Jirapa Municipal"],
};

const sampleConstituencies: Record<string, string[]> = {
  "Kumasi Metropolitan": ["Kumasi Central", "Nhyiaeso", "Subin", "Manhyia North", "Manhyia South", "Bantama"],
  "Accra Metropolitan": ["Accra Central", "Odododiodoo", "Ablekuma South", "Okaikwei Central"],
  "Tamale Metropolitan": ["Tamale Central", "Tamale South", "Sagnarigu"],
  "Sekondi-Takoradi Metropolitan": ["Takoradi", "Sekondi", "Essikado-Ketan", "Effia"],
  "Sunyani Municipal": ["Sunyani East", "Sunyani West"],
  "Obuasi Municipal": ["Obuasi East", "Obuasi West"],
  "Tema Metropolitan": ["Tema East", "Tema West", "Tema Central"],
  "Cape Coast Metropolitan": ["Cape Coast North", "Cape Coast South"],
  "Ho Municipal": ["Ho Central", "Ho West"],
  "Bolgatanga Municipal": ["Bolgatanga Central", "Bolgatanga East"],
  "Wa Municipal": ["Wa Central", "Wa West"],
};
import { Skeleton } from "@/components/ui/skeleton";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import IssueCard from "@/components/IssueCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useIssues, type DbIssue } from "@/hooks/useIssues";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Issue } from "@/data/sampleData";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { data: roleData } = useUserRole();
  const { data: dbIssues } = useIssues("newest");
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [region, setRegion] = useState(profile?.region || "");
  const [district, setDistrict] = useState(profile?.district || "");
  const [constituency, setConstituency] = useState(profile?.constituency || "");
  const [saving, setSaving] = useState(false);
  const [preferredLang, setPreferredLang] = useState<string>(
    () => localStorage.getItem("cit_preferred_lang") || ""
  );

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setDisplayName(profile.display_name || "");
      setRegion(profile.region || "");
      setDistrict(profile.district || "");
      setConstituency(profile.constituency || "");
    }
  }, [profile]);

  const districts = region ? sampleDistricts[region] || [] : [];
  const constituencies = district ? sampleConstituencies[district] || [] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  const myIssues = (dbIssues || [])
    .filter((d: DbIssue) => d.user_id === user.id)
    .map((d: DbIssue): Issue => ({
      id: d.id,
      title: d.title,
      description: d.description,
      category: d.category,
      constituency: d.constituency,
      region: d.region,
      district: d.district,
      imageUrl: d.image_urls?.[0] || "",
      upvotes: d.upvotes_count,
      meTooCount: d.me_too_count,
      commentsCount: d.comments_count,
      urgency: d.urgency as Issue["urgency"],
      magnitudeScore: d.magnitude_score,
      status: d.status as Issue["status"],
      hasOfficialResponse: d.has_official_response,
      authorName: d.author_name || "Anonymous",
      authorAvatar: "",
      createdAt: d.created_at,
      daysOpen: Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000),
    }));

  const initials = (profile?.display_name || user.email || "U")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio, region: region || null, district: district || null, constituency: constituency || null })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated!");
    setEditMode(false);
    window.location.reload();
  };

  const roleBadge = roleData?.isOfficial
    ? roleData.isMP ? "MP" : roleData.isMinister ? "Minister" : roleData.isDCE ? "DCE" : roleData.isPresident ? "President" : "Official"
    : "Citizen";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-xl font-display font-bold text-primary shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-xl font-bold text-foreground truncate">
                    {profile?.display_name || user.email}
                  </h2>
                  <Badge className={roleData?.isOfficial ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                    {roleBadge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {profile?.constituency && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.constituency}, {profile.region}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {editMode && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div>
                  <Label className="text-sm">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="min-h-[80px]" />
                </div>
                <div>
                  <Label className="text-sm">Region</Label>
                  <Select value={region} onValueChange={(v) => { setRegion(v); setDistrict(""); setConstituency(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {districts.length > 0 && (
                  <div>
                    <Label className="text-sm">District</Label>
                    <Select value={district} onValueChange={(v) => { setDistrict(v); setConstituency(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {constituencies.length > 0 && (
                  <div>
                    <Label className="text-sm">Constituency</Label>
                    <Select value={constituency} onValueChange={setConstituency}>
                      <SelectTrigger><SelectValue placeholder="Select constituency" /></SelectTrigger>
                      <SelectContent>{constituencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {isKhayaConfigured() && (
                  <div>
                    <Label className="text-sm flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5" /> Preferred Language
                    </Label>
                    <Select
                      value={preferredLang}
                      onValueChange={(v) => {
                        setPreferredLang(v);
                        if (v) localStorage.setItem("cit_preferred_lang", v);
                        else localStorage.removeItem("cit_preferred_lang");
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="English (default)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (default)</SelectItem>
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.name} ({l.nativeName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Content will offer translation to this language via Khaya AI
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-xl font-bold text-foreground">{myIssues.length}</p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ThumbsUp className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="font-display text-xl font-bold text-foreground">
                {myIssues.reduce((sum, i) => sum + i.upvotes, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Upvotes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display text-xl font-bold text-foreground">
                {myIssues.reduce((sum, i) => sum + i.commentsCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </CardContent>
          </Card>
        </div>

        {/* My Issues */}
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">My Issues</h3>
          {myIssues.length > 0 ? (
            <div className="space-y-3">
              {myIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't reported any issues yet.</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link to="/report">Report Your First Issue</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sign Out & Delete */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full gap-2" onClick={signOut}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
          <Button
            variant="ghost"
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
              if (!window.confirm("This will permanently delete all your data. Type OK to confirm.")) return;
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${session?.access_token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (!res.ok) throw new Error("Failed to delete account");
                toast.success("Account deleted. Goodbye!");
                await signOut();
                navigate("/");
              } catch (err: any) {
                toast.error(err.message);
              }
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
