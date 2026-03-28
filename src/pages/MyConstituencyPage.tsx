import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, BarChart3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import IssueCard from "@/components/IssueCard";
import { useAuth } from "@/contexts/AuthContext";
import { useIssues, type DbIssue } from "@/hooks/useIssues";
import { sampleIssues, sampleLeaders, type Issue } from "@/data/sampleData";

const MyConstituencyPage = () => {
  const { user, profile } = useAuth();
  const { data: dbIssues, isLoading } = useIssues("trending");
  const constituency = profile?.constituency;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Sign in to see your constituency issues</p>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  if (!constituency) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <TopNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">No Constituency Set</h2>
          <p className="text-muted-foreground mb-4">Update your profile to see your constituency issues</p>
          <Button asChild><Link to="/profile">Go to Profile</Link></Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const dbFiltered = (dbIssues || [])
    .filter((d: DbIssue) => d.constituency === constituency)
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

  const sampleFiltered = sampleIssues.filter((i) => i.constituency === constituency);
  const allIssues = [...dbFiltered, ...sampleFiltered.filter((s) => !dbFiltered.find((d) => d.id === s.id))];
  const mp = sampleLeaders.find((l) => l.constituency === constituency);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">My Constituency</h1>
          <Badge variant="secondary">{constituency}</Badge>
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-bold text-foreground">{allIssues.length}</p>
                <p className="text-xs text-muted-foreground">Issues</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-primary">
                  {allIssues.filter((i) => i.status === "resolved").length}
                </p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-accent">
                  {allIssues.filter((i) => i.urgency === "critical").length}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MP Card */}
        {mp && (
          <Link to={`/leader/${mp.id}`}>
            <Card className="border-primary/20 hover:bg-primary/5 transition-colors">
              <CardContent className="p-4">
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Your MP</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {mp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{mp.name}</p>
                    <p className="text-xs text-muted-foreground">{mp.party} · Response rate: {mp.responseRate}%</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="font-semibold text-foreground">{mp.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Issues */}
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Issues in {constituency}
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : allIssues.length > 0 ? (
            <div className="space-y-3">
              {allIssues.sort((a, b) => b.magnitudeScore - a.magnitudeScore).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No issues reported in your constituency yet.</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link to="/report">Report an Issue</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MyConstituencyPage;
