import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Clock, AlertTriangle, Filter, LogIn, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import IssueCard from "@/components/IssueCard";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIssues, type DbIssue } from "@/hooks/useIssues";
import { sampleIssues, categories, type Issue } from "@/data/sampleData";

type SortMode = "trending" | "newest" | "urgent";

const FeedPage = () => {
  const [sort, setSort] = useState<SortMode>("trending");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMyConstituency, setShowMyConstituency] = useState(false);
  const { user, profile } = useAuth();

  const { data: dbIssues, isLoading } = useIssues(sort, selectedCategory);

  const dbAsIssue = (dbIssues || []).map((d: DbIssue): Issue => ({
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

  const allIssues = [...dbAsIssue, ...sampleIssues.filter((s) => !dbAsIssue.find((d) => d.id === s.id))];

  const filteredIssues = allIssues
    .filter((i) => !selectedCategory || i.category === selectedCategory)
    .filter((i) => !showMyConstituency || !profile?.constituency || i.constituency === profile.constituency);

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sort === "trending") return b.magnitudeScore - a.magnitudeScore;
    if (sort === "urgent") return b.urgency === "critical" ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <div className="sticky top-0 md:top-14 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-12 px-4">
          <span className="font-display font-bold text-foreground text-sm md:hidden">🇬🇭 CIT</span>
          <div className="flex items-center gap-1">
            {([
              { key: "trending", label: "Trending", icon: TrendingUp },
              { key: "newest", label: "New", icon: Clock },
              { key: "urgent", label: "Urgent", icon: AlertTriangle },
            ] as const).map((s) => (
              <Button key={s.key} variant={sort === s.key ? "default" : "ghost"} size="sm" className="text-xs gap-1" onClick={() => setSort(s.key)}>
                <s.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </Button>
            ))}
            {profile?.constituency && (
              <Button
                variant={showMyConstituency ? "default" : "ghost"}
                size="sm"
                className="text-xs gap-1"
                onClick={() => setShowMyConstituency(!showMyConstituency)}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Area</span>
              </Button>
            )}
            {!user && (
              <Link to="/auth" className="md:hidden">
                <Button variant="outline" size="sm" className="text-xs gap-1 ml-2">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
          <Badge variant={selectedCategory === null ? "default" : "outline"} className="cursor-pointer shrink-0 px-3 py-1.5" onClick={() => setSelectedCategory(null)}>
            <Filter className="w-3 h-3 mr-1" /> All
          </Badge>
          {categories.map((cat) => (
            <Badge key={cat.name} variant={selectedCategory === cat.name ? "default" : "outline"} className="cursor-pointer shrink-0 px-3 py-1.5" onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}>
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>

        {showMyConstituency && profile?.constituency && (
          <div className="mb-4 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Showing issues in {profile.constituency}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setShowMyConstituency(false)}>Show All</Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        )}

        {!isLoading && sortedIssues.length === 0 && (
          <div className="text-center py-16"><p className="text-muted-foreground">No issues found.</p></div>
        )}
      </div>

      <Link to={user ? "/report" : "/auth"} className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 bg-secondary text-secondary-foreground rounded-full shadow-gold flex items-center justify-center hover:scale-105 transition-transform">
        <Plus className="w-7 h-7" />
      </Link>

      <BottomNav />
    </div>
  );
};

export default FeedPage;
