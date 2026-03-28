import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronUp,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  Hammer,
  XCircle,
  FileText,
  Share2,
  Users,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProject,
  useProjectVote,
  type ProjectStatus,
  type DbProject,
} from "@/hooks/useProjects";
import { sampleProjects, generateSampleProjectsForConstituency } from "@/data/sampleData";
import { isUuid } from "@/lib/isUuid";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import TranslateBar from "@/components/TranslateBar";
import ListenButton from "@/components/ListenButton";

const statusConfig: Record<
  ProjectStatus,
  { label: string; icon: typeof FileText; className: string; bg: string }
> = {
  proposed: {
    label: "Proposed",
    icon: FileText,
    className: "text-muted-foreground",
    bg: "bg-muted",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    className: "text-secondary",
    bg: "bg-secondary/10",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "text-primary",
    bg: "bg-primary/10",
  },
  in_progress: {
    label: "In Progress",
    icon: Hammer,
    className: "text-blue-600",
    bg: "bg-blue-50",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "text-primary",
    bg: "bg-primary/10",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "text-destructive",
    bg: "bg-destructive/10",
  },
};

const voterNamesByConstituency: Record<string, string[]> = {
  "Accra Central": [
    "Fatima Mohammed", "Nana Osei Bonsu", "Akua Mensah", "Kweku Annan",
    "Adwoa Frimpong", "Edem Kplorm", "Cecilia Owusu", "James Quartey",
    "Abigail Tetteh", "Mohammed Issah",
  ],
  "Kumasi Central": [
    "Kwame Asante", "Kofi Mensah", "Yaa Pokua", "Samuel Tetteh",
    "Afia Boahemaa", "Prince Owusu", "Mary Adomako", "Evans Darko",
    "Comfort Achiaa", "Isaac Appiah",
  ],
  "Tamale Central": [
    "Abdul-Razak Ibrahim", "Ibrahim Yakubu", "Rashida Adams", "Alhassan Fuseini",
    "Memunatu Alhassan", "Salifu Issahaku", "Amina Dawuni", "Haruna Iddrisu",
    "Zulaiha Mohammed", "Adam Baba",
  ],
  "Tamale South": [
    "Memunatu Alhassan", "Issah Ziblim", "Abukari Rashid", "Fati Alhassan",
    "Haruna Sule", "Amina Seidu", "Alhassan Bukari", "Rashida Yakubu",
    "Salifu Adam", "Mariama Fuseini",
  ],
  Takoradi: [
    "Esi Mensah", "Grace Appiah", "Joseph Eghan", "Abena Osei",
    "Emmanuel Quansah", "Charity Aidoo", "Michael Essien", "Akosua Adjei",
    "Richard Mensah", "Felicia Amoh",
  ],
  Sunyani: [
    "Yaw Boateng", "Daniel Boateng", "Grace Appiah", "Comfort Owusu",
    "Samuel Owusu-Ansah", "Abena Kyerewaa", "Philip Donkor", "Rita Sarpong",
    "Emmanuel Asare", "Florence Mensah",
  ],
  Bantama: [
    "Akosua Afriyie", "Patience Adjei", "Kwadwo Poku", "Adwoa Sarpong",
    "Isaac Boateng", "Maame Akua", "Osei Mensah", "Afia Konadu",
    "Yaw Acheampong", "Efua Nyarko",
  ],
};

const defaultVoterNames = [
  "Citizen 1", "Citizen 2", "Citizen 3", "Citizen 4", "Citizen 5",
  "Citizen 6", "Citizen 7", "Citizen 8",
];

const times = ["1h ago", "2h ago", "4h ago", "6h ago", "9h ago", "14h ago", "1d ago", "2d ago", "3d ago", "4d ago"];

function getVotersForProject(projectId: string, constituency: string) {
  const names = voterNamesByConstituency[constituency] ?? defaultVoterNames;
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(i);
  }
  const count = 5 + (Math.abs(hash) % Math.min(4, names.length - 4));
  const shuffled = [...names].sort(
    (a, b) => ((a.charCodeAt(0) * 31 + hash) % 97) - ((b.charCodeAt(0) * 31 + hash) % 97)
  );
  return shuffled.slice(0, count).map((name, i) => ({
    name,
    constituency,
    time: times[i % times.length],
  }));
}

const milestones = [
  { votes: 100, label: "100 votes — Visible to MP" },
  { votes: 250, label: "250 votes — Flagged for review" },
  { votes: 500, label: "500 votes — Priority consideration" },
  { votes: 1000, label: "1,000 votes — Formal response required" },
];

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isSample = !!id && !isUuid(id);

  const { data: dbProject, isLoading } = useProject(id || "");
  const voteMutation = useProjectVote();
  const [sampleVoted, setSampleVoted] = useState(false);
  const [sampleBoost, setSampleBoost] = useState(0);
  const {
    translate: doTranslate,
    clearTranslation,
    getTranslated,
    isTranslating,
    isTranslated,
    activeLang,
    configured: translationConfigured,
  } = useTranslation();

  const userGenerated =
    profile?.constituency && profile?.region
      ? generateSampleProjectsForConstituency(
          profile.constituency,
          profile.region,
          profile.district || profile.region
        )
      : [];
  const allSamples = [...sampleProjects, ...userGenerated];
  const sampleMatch = allSamples.find((p) => p.id === id);
  const project: DbProject | null = dbProject ?? (sampleMatch
    ? {
        id: sampleMatch.id,
        user_id: "",
        title: sampleMatch.title,
        description: sampleMatch.description,
        category: sampleMatch.category,
        constituency: sampleMatch.constituency,
        region: sampleMatch.region,
        district: sampleMatch.district,
        estimated_impact: sampleMatch.estimated_impact,
        status: sampleMatch.status as ProjectStatus,
        vote_count: sampleMatch.vote_count + sampleBoost,
        created_at: sampleMatch.created_at,
        updated_at: sampleMatch.created_at,
        author_name: sampleMatch.author_name,
        has_voted: sampleVoted,
      }
    : null);

  const canVote =
    !!user && !!profile?.constituency && profile.constituency === project?.constituency;

  const handleVote = () => {
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth");
      return;
    }
    if (!profile?.constituency) {
      toast.error("Set your constituency in your profile before voting");
      navigate("/profile");
      return;
    }
    if (project && profile.constituency !== project.constituency) {
      toast.error("You can only vote on projects in your own constituency");
      return;
    }
    if (!id || !project) return;

    if (isSample) {
      setSampleVoted((prev) => !prev);
      setSampleBoost((prev) => (sampleVoted ? prev - 1 : prev + 1));
      toast.success(sampleVoted ? "Vote removed" : "Vote recorded");
      return;
    }
    voteMutation.mutate({
      projectId: id,
      projectConstituency: project.constituency,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: project?.title,
        text: project?.description?.slice(0, 120),
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading && !sampleMatch) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <TopNav />
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full rounded-sm" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Project not found
          </h2>
          <Link to="/projects">
            <Button variant="outline" size="sm">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[project.status] ?? statusConfig.proposed;
  const StatusIcon = status.icon;
  const daysAgo = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / 86400000
  );
  const voters = getVotersForProject(project.id, project.constituency);

  const currentMilestone = milestones.findLast(
    (m) => project.vote_count >= m.votes
  );
  const nextMilestone = milestones.find(
    (m) => project.vote_count < m.votes
  );
  const progressPercent = nextMilestone
    ? Math.min(
        100,
        ((project.vote_count - (currentMilestone?.votes ?? 0)) /
          (nextMilestone.votes - (currentMilestone?.votes ?? 0))) *
          100
      )
    : 100;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      <header className="sticky top-0 md:top-14 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-display font-semibold text-foreground text-sm truncate">
              Project Detail
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="Share project"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
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

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          {getTranslated("title", project.title)}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {project.constituency}, {project.region}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {daysAgo}d ago
          </span>
          <span>by {project.author_name}</span>
        </div>

        {/* Translation bar */}
        {translationConfigured && (
          <div className="mb-6">
            <TranslateBar
              onTranslate={(lang) =>
                doTranslate(
                  [
                    { key: "title", text: project.title },
                    { key: "description", text: project.description },
                    ...(project.estimated_impact
                      ? [{ key: "impact", text: project.estimated_impact }]
                      : []),
                  ],
                  lang
                )
              }
              onClear={clearTranslation}
              isTranslating={isTranslating}
              isTranslated={isTranslated}
              activeLang={activeLang}
            />
          </div>
        )}

        {/* Vote card */}
        <div className="bg-card border border-border rounded-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-display text-3xl font-bold text-foreground">
                  {project.vote_count}
                </span>
                <span className="text-sm text-muted-foreground">
                  {project.vote_count === 1 ? "vote" : "votes"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Higher votes = higher priority for your MP
              </p>
            </div>
            <Button
              variant={project.has_voted ? "default" : "outline"}
              className="gap-2 min-w-[120px]"
              onClick={handleVote}
              disabled={voteMutation.isPending || (!!user && !canVote && !project.has_voted)}
            >
              <ChevronUp className="w-4 h-4" />
              {project.has_voted ? "Voted" : "Vote"}
            </Button>
          </div>

          {!user && (
            <div className="bg-muted rounded-sm px-3 py-2 text-center mb-3">
              <p className="text-xs text-muted-foreground">
                <Link
                  to="/auth"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>{" "}
                to vote on this project
              </p>
            </div>
          )}

          {user && !profile?.constituency && (
            <div className="bg-muted rounded-sm px-3 py-2 text-center mb-3">
              <p className="text-xs text-muted-foreground">
                <Link
                  to="/profile"
                  className="text-primary font-semibold hover:underline"
                >
                  Set your constituency
                </Link>{" "}
                in your profile to vote
              </p>
            </div>
          )}

          {user && profile?.constituency && profile.constituency !== project.constituency && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-sm px-3 py-2 text-center mb-3">
              <p className="text-xs text-muted-foreground">
                You can only vote on projects in your constituency ({profile.constituency})
              </p>
            </div>
          )}

          {/* Progress toward next milestone */}
          {nextMilestone && (
            <div className="mt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Next: {nextMilestone.label}
                </span>
                <span>
                  {nextMilestone.votes - project.vote_count} votes to go
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
          {!nextMilestone && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              All milestones reached — formal response required from your MP
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="bg-card border border-border rounded-sm p-4 mb-6">
          <h3 className="font-display text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
            Vote Milestones
          </h3>
          <div className="space-y-2">
            {milestones.map((m) => {
              const reached = project.vote_count >= m.votes;
              return (
                <div
                  key={m.votes}
                  className={`flex items-center gap-2 text-xs ${
                    reached ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 shrink-0 ${
                      reached ? "text-primary" : "text-border"
                    }`}
                  />
                  <span className={reached ? "font-medium" : ""}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Description */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
              Description
            </h2>
            <ListenButton text={project.description} />
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {getTranslated("description", project.description)}
          </p>
        </section>

        {/* Estimated impact */}
        {project.estimated_impact && (
          <>
            <Separator className="mb-6" />
            <section className="mb-6">
              <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
                Estimated Impact
              </h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {getTranslated("impact", project.estimated_impact)}
              </p>
            </section>
          </>
        )}

        <Separator className="mb-6" />

        {/* Location */}
        <section className="mb-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
            Location
          </h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-sm">
              {project.region}
            </span>
            <span className="px-2 py-1 bg-muted rounded-sm">
              {project.district}
            </span>
            <span className="px-2 py-1 bg-muted rounded-sm">
              {project.constituency}
            </span>
          </div>
        </section>

        <Separator className="mb-6" />

        {/* Recent voters */}
        <section>
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            Recent Voters
          </h2>
          <div className="space-y-0">
            {voters.map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {v.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {v.constituency}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {v.time}
                </span>
              </div>
            ))}
          </div>
          {project.vote_count > voters.length && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              and {project.vote_count - voters.length} more voters
            </p>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProjectDetailPage;
