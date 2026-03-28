import { Link } from "react-router-dom";
import { ArrowLeft, Star, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sampleLeaders } from "@/data/sampleData";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-secondary text-secondary" : "text-border"}`}
      />
    ))}
    <span className="ml-1.5 text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
  </div>
);

const LeaderboardPage = () => {
  const sorted = [...sampleLeaders].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Leader Ratings</h1>

        <div className="space-y-3">
          {sorted.map((leader, index) => (
            <Link key={leader.id} to={`/leader/${leader.id}`} className="block">
              <div className="bg-card border border-border rounded-xl p-4 hover:shadow-ghana transition-all hover:border-primary/20">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                    index === 0 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-foreground truncate">{leader.name}</span>
                      {leader.verified && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">Verified</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {leader.role.toUpperCase()} · {leader.constituency || leader.ministry} · {leader.party}
                    </div>
                    <StarRating rating={leader.rating} />
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      {leader.responseRate >= 50 ? (
                        <TrendingUp className="w-4 h-4 text-primary" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-accent" />
                      )}
                      <span className={`text-sm font-semibold ${leader.responseRate >= 50 ? "text-primary" : "text-accent"}`}>
                        {leader.responseRate}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">response rate</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
