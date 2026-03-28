import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, Users, MessageCircle, CheckCircle, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import ShareButtons from "@/components/ShareButtons";
import CommentNode from "@/components/CommentThread";
import { useAuth } from "@/contexts/AuthContext";
import { useIssue, useUpvote, useMeToo } from "@/hooks/useIssues";
import { useComments, useAddComment } from "@/hooks/useComments";
import { sampleIssues } from "@/data/sampleData";
import { formatDistanceToNow } from "date-fns";

const IssueDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  // Try DB first, fallback to sample data
  const { data: dbIssue, isLoading } = useIssue(id || "");
  const sampleIssue = sampleIssues.find((i) => i.id === id);
  const issue = dbIssue || (sampleIssue ? {
    id: sampleIssue.id,
    title: sampleIssue.title,
    description: sampleIssue.description,
    category: sampleIssue.category,
    constituency: sampleIssue.constituency,
    region: sampleIssue.region,
    district: sampleIssue.district,
    urgency: sampleIssue.urgency,
    status: sampleIssue.status,
    upvotes_count: sampleIssue.upvotes,
    me_too_count: sampleIssue.meTooCount,
    comments_count: sampleIssue.commentsCount,
    magnitude_score: sampleIssue.magnitudeScore,
    has_official_response: sampleIssue.hasOfficialResponse,
    author_name: sampleIssue.authorName,
    created_at: sampleIssue.createdAt,
    image_urls: [] as string[],
  } : null);

  const { data: comments = [] } = useComments(id || "");
  const upvote = useUpvote();
  const meToo = useMeToo();
  const addComment = useAddComment();

  const urgencyColors: Record<string, string> = {
    low: "bg-urgency-low text-primary-foreground",
    medium: "bg-urgency-medium text-secondary-foreground",
    high: "bg-urgency-high text-primary-foreground",
    critical: "bg-urgency-critical text-accent-foreground",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto flex items-center h-14 px-4 gap-3">
            <Link to="/feed" className="text-muted-foreground"><ArrowLeft className="w-5 h-5" /></Link>
            <Skeleton className="h-4 w-32" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Issue Not Found</h2>
          <Link to="/feed" className="text-primary underline">Back to Feed</Link>
        </div>
      </div>
    );
  }

  const handleComment = () => {
    if (!commentText.trim() || !id) return;
    addComment.mutate({ issueId: id, content: commentText }, {
      onSuccess: () => setCommentText(""),
    });
  };

  const daysOpen = Math.floor((Date.now() - new Date(issue.created_at).getTime()) / 86400000);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />
      <div className="sticky top-0 md:top-14 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center h-12 px-4 gap-3">
          <Link to="/feed" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-semibold text-foreground truncate text-sm">Issue Details</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant="secondary">{issue.category}</Badge>
          <Badge className={urgencyColors[issue.urgency] || ""}>{issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1)}</Badge>
          {issue.has_official_response && (
            <Badge className="bg-primary text-primary-foreground gap-1">
              <CheckCircle className="w-3 h-3" /> Official Response
            </Badge>
          )}
        </div>

        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{issue.title}</h2>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{issue.constituency}, {issue.region}</span></div>
          <span>·</span>
          <span>{daysOpen} days ago</span>
          <span>·</span>
          <span>by {issue.author_name || "Anonymous"}</span>
        </div>

        {/* Magnitude */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Magnitude Score</div>
          <div className="flex items-end gap-4">
            <span className="font-display text-4xl font-bold text-primary">{issue.magnitude_score}</span>
            <div className="flex gap-4 pb-1">
              <div className="text-center">
                <div className="font-semibold text-foreground">{issue.upvotes_count}</div>
                <div className="text-xs text-muted-foreground">Upvotes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-accent">{issue.me_too_count}</div>
                <div className="text-xs text-muted-foreground">Me Too</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{issue.comments_count}</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
        </div>

        {/* Photos */}
        {issue.image_urls && issue.image_urls.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {issue.image_urls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity">
                  <img src={url} alt={`Issue photo ${i + 1}`} className="w-full h-40 object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-8">
          <Button className="flex-1 gap-2" onClick={() => id && upvote.mutate(id)} disabled={upvote.isPending}>
            <ArrowUp className="w-4 h-4" /> Upvote
          </Button>
          <Button variant="destructive" className="flex-1 gap-2" onClick={() => id && meToo.mutate(id)} disabled={meToo.isPending}>
            <Users className="w-4 h-4" /> Me Too
          </Button>
          <ShareButtons title={issue.title} />
        </div>

        {/* Comments section */}
        <div className="border-t border-border pt-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Comments ({comments.length || issue.comments_count})
          </h3>

          {/* New comment */}
          {user ? (
            <div className="flex gap-2 mb-6">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px]"
              />
              <Button size="icon" onClick={handleComment} disabled={addComment.isPending || !commentText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to join the conversation
              </p>
            </div>
          )}

          {/* Comment threads */}
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentNode key={comment.id} comment={comment} issueId={id || ""} />
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default IssueDetailPage;
