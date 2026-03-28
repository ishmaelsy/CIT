import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Users, BarChart3 } from "lucide-react";
import IssueCard from "@/components/IssueCard";
import { sampleConstituencies, sampleIssues, sampleLeaders } from "@/data/sampleData";
import BottomNav from "@/components/BottomNav";

const ConstituencyPage = () => {
  const { id } = useParams();
  const constituency = sampleConstituencies.find((c) => c.id === id);

  if (!constituency) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Constituency Not Found</h2>
          <Link to="/priority-board" className="text-primary underline">Back to Board</Link>
        </div>
      </div>
    );
  }

  const issues = sampleIssues.filter((i) => i.constituency === constituency.name).sort((a, b) => b.magnitudeScore - a.magnitudeScore);
  const mp = sampleLeaders.find((l) => l.constituency === constituency.name);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Link to="/priority-board" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-semibold text-foreground truncate text-sm">{constituency.name}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Overview */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">{constituency.name}</h2>
          <p className="text-sm text-muted-foreground mb-4">{constituency.region} Region · {constituency.district}</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-display text-2xl font-bold text-foreground">{constituency.totalIssues}</div>
              <div className="text-xs text-muted-foreground">Total Issues</div>
            </div>
            <div>
              <div className={`font-display text-2xl font-bold ${constituency.resolvedPercent >= 40 ? "text-primary" : "text-accent"}`}>
                {constituency.resolvedPercent}%
              </div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-foreground flex items-center gap-1">
                <Star className="w-5 h-5 fill-secondary text-secondary" /> {constituency.mpRating}
              </div>
              <div className="text-xs text-muted-foreground">MP Rating</div>
            </div>
          </div>
        </div>

        {/* MP Card */}
        {mp && (
          <Link to={`/leader/${mp.id}`} className="block mb-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors">
              <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Current MP</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {mp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{mp.name}</div>
                  <div className="text-xs text-muted-foreground">{mp.party} · Response rate: {mp.responseRate}%</div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Issues */}
        <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Top Issues
        </h3>
        <div className="space-y-3">
          {issues.length > 0 ? (
            issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No issues reported in this constituency yet.</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ConstituencyPage;
