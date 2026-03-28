import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Clock, MapPin, Filter, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "@/components/ProjectCard";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects, useProjectVote, type DbProject } from "@/hooks/useProjects";
import { categories, sampleProjects, generateSampleProjectsForConstituency } from "@/data/sampleData";
import { toast } from "sonner";

type SortMode = "top" | "newest" | "constituency";

const ProjectSuggestionsPage = () => {
  const [sort, setSort] = useState<SortMode>("top");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterConstituency, setFilterConstituency] = useState(false);
  const { user, profile } = useAuth();

  const constituencyFilter =
    filterConstituency && profile?.constituency ? profile.constituency : null;

  const { data: dbProjects, isLoading } = useProjects(
    sort,
    selectedCategory,
    constituencyFilter
  );
  const voteMutation = useProjectVote();

  const userGenerated =
    profile?.constituency && profile?.region
      ? generateSampleProjectsForConstituency(
          profile.constituency,
          profile.region,
          profile.district || profile.region
        )
      : [];

  const allSamples = [...sampleProjects, ...userGenerated];

  const sampleAsDb = allSamples.map(
    (s): DbProject => ({
      id: s.id,
      user_id: "",
      title: s.title,
      description: s.description,
      category: s.category,
      constituency: s.constituency,
      region: s.region,
      district: s.district,
      estimated_impact: s.estimated_impact,
      status: s.status,
      vote_count: s.vote_count,
      created_at: s.created_at,
      updated_at: s.created_at,
      author_name: s.author_name,
      has_voted: false,
    })
  );

  const merged = [
    ...(dbProjects || []),
    ...sampleAsDb.filter((s) => !(dbProjects || []).find((d) => d.id === s.id)),
  ];

  const filtered = merged
    .filter((p) => !selectedCategory || p.category === selectedCategory)
    .filter(
      (p) =>
        !constituencyFilter || p.constituency === constituencyFilter
    );

  const projects = [...filtered].sort((a, b) => {
    if (sort === "top") return b.vote_count - a.vote_count;
    if (sort === "newest")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return a.constituency.localeCompare(b.constituency) || b.vote_count - a.vote_count;
  });

  const handleVote = (id: string) => {
    if (!user) return;
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    if (!profile?.constituency) {
      toast.error("Set your constituency in your profile before voting");
      return;
    }
    if (profile.constituency !== target.constituency) {
      toast.error("You can only vote on projects in your own constituency");
      return;
    }
    voteMutation.mutate({ projectId: id, projectConstituency: target.constituency });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

      {/* Sticky toolbar */}
      <div className="sticky top-0 md:top-14 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-12 px-4">
          <span className="font-display font-bold text-foreground text-sm md:hidden">
            Projects
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { key: "top", label: "Top Voted", icon: TrendingUp },
                { key: "newest", label: "New", icon: Clock },
                { key: "constituency", label: "By Area", icon: MapPin },
              ] as const
            ).map((s) => (
              <Button
                key={s.key}
                variant={sort === s.key ? "default" : "ghost"}
                size="sm"
                className="text-xs gap-1"
                onClick={() => setSort(s.key)}
              >
                <s.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </Button>
            ))}
            {profile?.constituency && (
              <Button
                variant={filterConstituency ? "default" : "ghost"}
                size="sm"
                className="text-xs gap-1"
                onClick={() => setFilterConstituency(!filterConstituency)}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Area</span>
              </Button>
            )}
            {!user && (
              <Link to="/auth" className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 ml-2"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* Page header */}
        <div className="mb-4">
          <h1 className="font-display text-xl font-bold text-foreground">
            Project Suggestions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Propose projects for your MP to deliver. The highest-voted projects
            signal community priority.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer shrink-0 px-3 py-1.5"
            onClick={() => setSelectedCategory(null)}
          >
            <Filter className="w-3 h-3 mr-1" /> All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              className="cursor-pointer shrink-0 px-3 py-1.5"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.name ? null : cat.name
                )
              }
            >
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>

        {/* Constituency filter banner */}
        {filterConstituency && profile?.constituency && (
          <div className="mb-4 bg-primary/5 border border-primary/20 rounded-sm px-3 py-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Showing projects in {profile.constituency}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs"
              onClick={() => setFilterConstituency(false)}
            >
              Show All
            </Button>
          </div>
        )}

        {/* Project list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(projects || []).map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                rank={sort === "top" ? idx + 1 : undefined}
                onVote={handleVote}
                voting={voteMutation.isPending}
                userConstituency={profile?.constituency}
              />
            ))}
          </div>
        )}

        {!isLoading && (!projects || projects.length === 0) && (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">
              No project suggestions yet.
            </p>
            {user && (
              <Link to="/projects/suggest">
                <Button size="sm">Suggest a project</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        to={user ? "/projects/suggest" : "/auth"}
        className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 bg-secondary text-secondary-foreground rounded-full shadow-gold flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Suggest a project"
      >
        <Plus className="w-7 h-7" />
      </Link>

      <BottomNav />
    </div>
  );
};

export default ProjectSuggestionsPage;
