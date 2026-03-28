import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sampleIssues, sampleConstituencies } from "@/data/sampleData";
import BottomNav from "@/components/BottomNav";

const PriorityBoardPage = () => {
  const topIssues = [...sampleIssues].sort((a, b) => b.magnitudeScore - a.magnitudeScore).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Link to="/feed" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-semibold text-foreground">Priority Board</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Top Priority Issues */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-xl font-bold text-foreground">Top Priority Issues</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Ranked by combined citizen votes and magnitude score across all constituencies.</p>

          <div className="space-y-3">
            {topIssues.map((issue, index) => (
              <Link key={issue.id} to={`/issue/${issue.id}`}>
                <div className="bg-card border border-border rounded-xl p-4 hover:shadow-ghana transition-all hover:border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                      index === 0 ? "bg-secondary text-secondary-foreground" :
                      index === 1 ? "bg-muted text-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground truncate">{issue.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{issue.category}</Badge>
                        <span className="text-xs text-muted-foreground">{issue.constituency}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-xl font-bold text-primary">{issue.magnitudeScore}</div>
                      <div className="text-xs text-muted-foreground">score</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Constituencies */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Constituency Overview</h2>
          </div>

          <div className="space-y-3">
            {sampleConstituencies.map((c) => (
              <Link key={c.id} to={`/constituency/${c.id}`}>
                <div className="bg-card border border-border rounded-xl p-4 hover:shadow-ghana transition-all hover:border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                    <span className="text-sm text-muted-foreground">{c.region}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">{c.totalIssues}</span>
                      <span className="text-muted-foreground ml-1">issues</span>
                    </div>
                    <div>
                      <span className={`font-semibold ${c.resolvedPercent >= 40 ? "text-primary" : "text-accent"}`}>{c.resolvedPercent}%</span>
                      <span className="text-muted-foreground ml-1">resolved</span>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">{c.mpName}</div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${c.resolvedPercent}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PriorityBoardPage;
