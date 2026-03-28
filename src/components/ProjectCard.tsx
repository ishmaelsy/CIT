import { ChevronUp, MapPin, Clock, CheckCircle, Eye, Hammer, XCircle, FileText, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DbProject, ProjectStatus } from "@/hooks/useProjects";

const statusConfig: Record<ProjectStatus, { label: string; icon: typeof FileText; className: string }> = {
  proposed: { label: "Proposed", icon: FileText, className: "text-muted-foreground" },
  under_review: { label: "Under Review", icon: Eye, className: "text-secondary" },
  approved: { label: "Approved", icon: CheckCircle, className: "text-primary" },
  in_progress: { label: "In Progress", icon: Hammer, className: "text-blue-600" },
  completed: { label: "Completed", icon: CheckCircle, className: "text-primary" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive" },
};

interface ProjectCardProps {
  project: DbProject;
  rank?: number;
  onVote?: (id: string) => void;
  voting?: boolean;
  userConstituency?: string | null;
}

const ProjectCard = ({ project, rank, onVote, voting, userConstituency }: ProjectCardProps) => {
  const canVote = !userConstituency || userConstituency === project.constituency;
  const status = statusConfig[project.status] ?? statusConfig.proposed;
  const StatusIcon = status.icon;
  const daysAgo = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / 86400000
  );

  return (
    <div className="bg-card border border-border rounded-sm p-4 hover:border-primary/30 transition-colors group">
      <div className="flex gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center shrink-0 -mt-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (canVote) onVote?.(project.id);
                }}
                disabled={voting || (!canVote && !project.has_voted)}
                aria-label={
                  !canVote
                    ? `Voting restricted to ${project.constituency} residents`
                    : project.has_voted
                      ? "Remove vote"
                      : "Vote for this project"
                }
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-sm border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  !canVote && !project.has_voted
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : project.has_voted
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary cursor-pointer"
                } ${voting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {!canVote && !project.has_voted ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
                <span className="font-display text-lg font-bold leading-none">
                  {project.vote_count}
                </span>
              </button>
            </TooltipTrigger>
            {!canVote && !project.has_voted && (
              <TooltipContent side="right" className="text-xs max-w-[200px]">
                Only {project.constituency} residents can vote
              </TooltipContent>
            )}
          </Tooltip>
          {rank != null && (
            <span className="text-[10px] font-medium text-muted-foreground mt-1">
              #{rank}
            </span>
          )}
        </div>

        {/* Content */}
        <Link to={`/projects/${project.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="secondary" className="text-xs font-medium">
              {project.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs gap-1 ${status.className}`}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>

          <h3 className="font-display text-base font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {project.description}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <MapPin className="w-3 h-3" />
            <span>{project.constituency}</span>
            <span className="mx-0.5">&middot;</span>
            <Clock className="w-3 h-3" />
            <span>{daysAgo}d ago</span>
            <span className="ml-auto">by {project.author_name}</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
