import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, MessageCircle, AlertTriangle, Shield, BarChart3, Clock, Users, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useIssues, type DbIssue } from "@/hooks/useIssues";
import { useAddComment } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const OfficialDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const { data: allIssues, isLoading } = useIssues("trending");
  const addComment = useAddComment();

  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Officials must sign in to access the dashboard</p>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  if (!roleLoading && !roleData?.isOfficial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-destructive/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Only verified officials can access this dashboard.</p>
          <Button asChild variant="outline"><Link to="/feed">Back to Feed</Link></Button>
        </div>
      </div>
    );
  }

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isOfficial = roleData?.isOfficial || false;
  const roleLabel = profile?.title || (roleData?.isMP ? "Member of Parliament" : roleData?.isMinister ? "Minister" : roleData?.isDCE ? "District Chief Executive" : roleData?.isPresident ? "President" : "Official");

  // Filter issues by jurisdiction
  const jurisdictionIssues = (allIssues || []).filter((issue: DbIssue) => {
    if (roleData?.isPresident || roleData?.isAdmin) return true;
    if (profile?.constituency) return issue.constituency === profile.constituency;
    if (profile?.region) return issue.region === profile.region;
    return true;
  });

  const openIssues = jurisdictionIssues.filter((i: DbIssue) => i.status === "open");
  const respondedIssues = jurisdictionIssues.filter((i: DbIssue) => i.has_official_response);
  const criticalIssues = jurisdictionIssues.filter((i: DbIssue) => i.urgency === "critical" && i.status !== "resolved");

  const handleResponse = async (issueId: string) => {
    if (!responseText.trim()) return;
    
    // Post official comment
    addComment.mutate(
      { issueId, content: responseText },
      {
        onSuccess: async () => {
          // Update issue status if selected
          if (statusUpdate) {
            await supabase.from("issues").update({
              status: statusUpdate,
              has_official_response: true,
            }).eq("id", issueId);
          } else {
            await supabase.from("issues").update({
              has_official_response: true,
            }).eq("id", issueId);
          }
          
          // Mark comment as official
          const { data: comments } = await supabase
            .from("comments")
            .select("id")
            .eq("issue_id", issueId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);
          
          if (comments && comments.length > 0) {
            await supabase.from("comments").update({ is_official: true }).eq("id", comments[0].id);
          }

          setRespondingTo(null);
          setResponseText("");
          setStatusUpdate("");
          toast.success("Official response posted!");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold">Official Dashboard</h1>
                <Badge className="bg-primary-foreground/20 text-primary-foreground">{roleLabel}</Badge>
              </div>
              <p className="text-primary-foreground/70 text-sm">
                {profile?.display_name} · {profile?.constituency || profile?.region || "National"}
              </p>
            </div>
            {!isOfficial && (
              <Badge className="bg-accent text-accent-foreground">
                ⚠️ No official role assigned
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {!isOfficial && (
          <Card className="border-secondary/30 bg-secondary/5">
            <CardContent className="p-4">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> You're viewing this as a citizen. Contact an administrator to get your official role assigned.
                You can still browse issues in your constituency.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Issues", value: jurisdictionIssues.length, icon: BarChart3, color: "text-primary" },
            { label: "Open Issues", value: openIssues.length, icon: AlertTriangle, color: "text-accent" },
            { label: "Responded", value: respondedIssues.length, icon: CheckCircle, color: "text-primary" },
            { label: "Critical", value: criticalIssues.length, icon: Clock, color: "text-accent" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending">Pending ({openIssues.length})</TabsTrigger>
            <TabsTrigger value="critical">Critical ({criticalIssues.length})</TabsTrigger>
            <TabsTrigger value="responded">Responded ({respondedIssues.length})</TabsTrigger>
          </TabsList>

          {(["pending", "critical", "responded"] as const).map((tab) => {
            const issues = tab === "pending" ? openIssues
              : tab === "critical" ? criticalIssues
              : respondedIssues;

            return (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {issues.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No {tab} issues</p>
                  </div>
                ) : (
                  issues.map((issue: DbIssue, i: number) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className={issue.urgency === "critical" ? "border-accent/30" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">{issue.category}</Badge>
                                <Badge className={`text-xs ${
                                  issue.urgency === "critical" ? "bg-urgency-critical text-accent-foreground" :
                                  issue.urgency === "high" ? "bg-urgency-high text-primary-foreground" :
                                  "bg-urgency-medium text-secondary-foreground"
                                }`}>{issue.urgency}</Badge>
                                {issue.has_official_response && (
                                  <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                                    <CheckCircle className="w-3 h-3" /> Responded
                                  </Badge>
                                )}
                              </div>
                              <Link to={`/issue/${issue.id}`} className="hover:underline">
                                <h3 className="font-display font-semibold text-foreground">{issue.title}</h3>
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1">
                                {issue.constituency} · {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                                {' '}· Score: {issue.magnitude_score}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>👍 {issue.upvotes_count}</span>
                                <span>🙋 {issue.me_too_count}</span>
                                <span>💬 {issue.comments_count}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>

                          {/* Response form */}
                          {respondingTo === issue.id ? (
                            <div className="border-t border-border pt-3 space-y-3">
                              <Textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Write your official response..."
                                className="min-h-[80px]"
                              />
                              <div className="flex items-center gap-3">
                                <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Update status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                    <SelectItem value="under-review">Under Review</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex gap-2 ml-auto">
                                  <Button variant="ghost" size="sm" onClick={() => { setRespondingTo(null); setResponseText(""); }}>
                                    Cancel
                                  </Button>
                                  <Button size="sm" className="gap-1" onClick={() => handleResponse(issue.id)} disabled={addComment.isPending}>
                                    <Send className="w-3.5 h-3.5" /> Post Response
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setRespondingTo(issue.id)}>
                                <MessageCircle className="w-3.5 h-3.5" /> Respond
                              </Button>
                              <Button size="sm" variant="ghost" className="text-xs" asChild>
                                <Link to={`/issue/${issue.id}`}>View Full Issue</Link>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default OfficialDashboard;
