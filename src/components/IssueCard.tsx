import { ArrowUp, MessageCircle, Users, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Issue } from "@/data/sampleData";
import { Link } from "react-router-dom";

const urgencyConfig = {
  low: { label: "Low", className: "bg-urgency-low text-primary-foreground" },
  medium: { label: "Medium", className: "bg-urgency-medium text-secondary-foreground" },
  high: { label: "High", className: "bg-urgency-high text-primary-foreground" },
  critical: { label: "Critical", className: "bg-urgency-critical text-accent-foreground animate-pulse-urgency" },
};

const statusConfig = {
  open: { label: "Open", icon: AlertTriangle, className: "text-accent" },
  "in-progress": { label: "In Progress", icon: Clock, className: "text-secondary" },
  resolved: { label: "Resolved", icon: CheckCircle, className: "text-primary" },
};

const IssueCard = ({ issue }: { issue: Issue }) => {
  const urgency = urgencyConfig[issue.urgency];
  const status = statusConfig[issue.status];
  const StatusIcon = status.icon;

  return (
    <Link to={`/issue/${issue.id}`} className="block">
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-ghana transition-all duration-200 hover:border-primary/20 group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge variant="secondary" className="text-xs font-medium">
                {issue.category}
              </Badge>
              <Badge className={`text-xs ${urgency.className}`}>
                {urgency.label}
              </Badge>
              {issue.hasOfficialResponse && (
                <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                  <CheckCircle className="w-3 h-3" /> Responded
                </Badge>
              )}
            </div>
            <h3 className="font-display text-base md:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
              {issue.title}
            </h3>
          </div>
          {/* Magnitude Score */}
          <div className="flex flex-col items-center shrink-0">
            <div className="text-xs text-muted-foreground font-medium">Score</div>
            <div className="font-display text-xl font-bold text-primary">{issue.magnitudeScore}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {issue.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <StatusIcon className={`w-3.5 h-3.5 ${status.className}`} />
          <span className={status.className}>{status.label}</span>
          <span className="mx-1">·</span>
          <span>{issue.constituency}</span>
          <span className="mx-1">·</span>
          <span>{issue.daysOpen}d ago</span>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowUp className="w-4 h-4" />
            <span className="font-medium">{issue.upvotes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
            <Users className="w-4 h-4" />
            <span className="font-medium">{issue.meTooCount}</span>
            <span className="hidden sm:inline">Me Too</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{issue.commentsCount}</span>
          </button>
          <div className="ml-auto text-xs text-muted-foreground">
            by {issue.authorName}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;
