import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle, Clock, MessageCircle, BarChart3, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { sampleLeaders, sampleIssues } from "@/data/sampleData";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmitRating } from "@/hooks/useLeaderRating";
import { toast } from "sonner";

const LeaderProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const leader = sampleLeaders.find((l) => l.id === id);
  const submitRating = useSubmitRating();

  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [showRatingForm, setShowRatingForm] = useState(false);

  if (!leader) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Leader Not Found</h2>
          <Link to="/leaderboard" className="text-primary underline">Back to Leaders</Link>
        </div>
      </div>
    );
  }

  const constituencyIssues = sampleIssues.filter((i) => i.constituency === leader.constituency);
  const ignoredIssues = constituencyIssues.filter((i) => !i.hasOfficialResponse && i.magnitudeScore > 500);

  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    // For sample leaders, use the leader id as a placeholder
    // In production, this would be the leader's actual user_id
    submitRating.mutate(
      { leaderUserId: leader.id, rating: selectedRating, review },
      {
        onSuccess: () => {
          setShowRatingForm(false);
          setSelectedRating(0);
          setReview("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link to="/leaderboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Leaders
        </Link>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-display font-bold text-primary">
              {leader.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-foreground">{leader.name}</h2>
                {leader.verified && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <div className="text-sm text-muted-foreground">
                {leader.role.toUpperCase()} · {leader.constituency} · {leader.party}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(leader.rating) ? "fill-secondary text-secondary" : "text-border"}`}
                />
              ))}
            </div>
            <span className="font-display text-2xl font-bold text-foreground">{leader.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({leader.totalRatings.toLocaleString()} ratings)</span>
          </div>

          {/* Rate Button */}
          {user ? (
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowRatingForm(!showRatingForm)}>
              <Star className="w-4 h-4" /> {showRatingForm ? "Cancel" : "Rate this Leader"}
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline" className="gap-1">
                <Star className="w-4 h-4" /> Sign in to Rate
              </Button>
            </Link>
          )}
        </div>

        {/* Rating Form */}
        {showRatingForm && (
          <Card className="mb-6 border-secondary/30">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Rate {leader.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Your rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setSelectedRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || selectedRating)
                          ? "fill-secondary text-secondary"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
                {selectedRating > 0 && (
                  <span className="font-display text-lg font-bold text-foreground ml-2">{selectedRating}/5</span>
                )}
              </div>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review (optional)..."
                className="min-h-[80px]"
              />
              <Button onClick={handleSubmitRating} disabled={submitRating.isPending} className="gap-1">
                <Send className="w-4 h-4" /> Submit Rating
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Response Rate", value: `${leader.responseRate}%`, icon: BarChart3, color: leader.responseRate >= 50 ? "text-primary" : "text-accent" },
            { label: "Avg Response", value: leader.avgResponseTime, icon: Clock, color: "text-foreground" },
            { label: "Issues Responded", value: `${leader.issuesResponded}/${leader.totalIssues}`, icon: MessageCircle, color: "text-foreground" },
            { label: "Rating Trend", value: leader.rating >= 3.5 ? "↑ Rising" : "↓ Declining", icon: BarChart3, color: leader.rating >= 3.5 ? "text-primary" : "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top Ignored Issues */}
        {ignoredIssues.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              🚨 Top Issues Ignored
            </h3>
            <div className="space-y-2">
              {ignoredIssues.map((issue) => (
                <Link key={issue.id} to={`/issue/${issue.id}`}>
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 hover:bg-accent/10 transition-colors">
                    <div className="font-medium text-sm text-foreground">{issue.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Score: {issue.magnitudeScore} · {issue.daysOpen} days without response
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LeaderProfilePage;
