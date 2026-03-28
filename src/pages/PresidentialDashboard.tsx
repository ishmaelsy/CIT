import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, TrendingDown, TrendingUp, MapPin, Users, BarChart3, Shield, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { sampleLeaders, sampleIssues, sampleConstituencies, categories, regions } from "@/data/sampleData";

// Ghana region data with simulated performance metrics
const regionData = regions.map((name, i) => ({
  name,
  avgRating: +(2 + Math.random() * 2.5).toFixed(1),
  totalIssues: Math.floor(30 + Math.random() * 200),
  resolvedPercent: Math.floor(15 + Math.random() * 55),
  population: Math.floor(200000 + Math.random() * 3000000),
  flagged: Math.random() > 0.6,
}));

const nationalStats = {
  totalIssues: sampleIssues.length * 42,
  resolvedPercent: 34,
  avgLeaderRating: 3.4,
  citizenParticipation: 67800,
  criticalUnresolved: 23,
  flaggedLeaders: 4,
};

const categoryBreakdown = categories.slice(0, 7).map((cat) => ({
  ...cat,
  count: Math.floor(20 + Math.random() * 300),
  percentage: Math.floor(5 + Math.random() * 25),
}));

// Leaders flagged for poor performance
const flaggedLeaders = [
  { ...sampleLeaders[2], flagReason: "Response rate below 20%" },
  { id: "4", name: "Hon. Grace Appiah", role: "mp" as const, constituency: "Takoradi", region: "Western", party: "NPP", rating: 1.9, totalRatings: 654, issuesResponded: 5, totalIssues: 43, responseRate: 12, avgResponseTime: "14 days", avatarUrl: "", verified: true, flagReason: "Rating below 2 stars" },
  { id: "5", name: "Hon. Emmanuel Boateng", role: "dce" as const, district: "Kumasi Metropolitan", region: "Ashanti", party: "NDC", rating: 1.7, totalRatings: 432, issuesResponded: 3, totalIssues: 56, responseRate: 5, avgResponseTime: "21 days", avatarUrl: "", verified: true, flagReason: "Response rate 5%, Rating 1.7" },
];

const getRegionColor = (rating: number) => {
  if (rating >= 4) return "bg-primary/80";
  if (rating >= 3) return "bg-secondary/80";
  if (rating >= 2.5) return "bg-urgency-high/60";
  return "bg-accent/70";
};

const PresidentialDashboard = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const selectedRegionData = regionData.find((r) => r.name === selectedRegion);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-bold">Presidential Dashboard</h1>
              <p className="text-xs text-primary-foreground/60">National Overview</p>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" /> {nationalStats.flaggedLeaders} Flagged
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* National Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Issues", value: nationalStats.totalIssues.toLocaleString(), icon: BarChart3, color: "text-primary" },
            { label: "Resolved", value: `${nationalStats.resolvedPercent}%`, icon: Shield, color: "text-primary" },
            { label: "Avg Leader Rating", value: `${nationalStats.avgLeaderRating}/5`, icon: Star, color: "text-secondary" },
            { label: "Active Citizens", value: nationalStats.citizenParticipation.toLocaleString(), icon: Users, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert Banner */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{nationalStats.criticalUnresolved} Critical Issues Unresolved</p>
              <p className="text-xs text-muted-foreground mt-1">
                {nationalStats.flaggedLeaders} leaders auto-flagged for response rate below 20% or rating below 2 stars.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="map">Regions</TabsTrigger>
            <TabsTrigger value="leaders">Leaders</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
          </TabsList>

          {/* Region Heatmap */}
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Ghana Regions — Performance Heatmap
                </CardTitle>
                <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/80" /> 4+ Rating</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary/80" /> 3–4</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-urgency-high/60" /> 2.5–3</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent/70" /> Below 2.5</span>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {regionData.map((region, i) => (
                  <motion.button
                    key={region.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    className={`relative p-3 rounded-lg text-left transition-all border-2 ${
                      selectedRegion === region.name ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    } ${getRegionColor(region.avgRating)}`}
                  >
                    <p className="text-xs font-bold text-foreground truncate">{region.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-secondary fill-secondary" />
                      <span className="text-xs font-semibold text-foreground">{region.avgRating}</span>
                    </div>
                    <p className="text-[10px] text-foreground/70 mt-0.5">{region.totalIssues} issues</p>
                    {region.flagged && (
                      <AlertTriangle className="absolute top-2 right-2 w-3.5 h-3.5 text-accent" />
                    )}
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Region Drill-Down */}
            {selectedRegionData && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{selectedRegionData.name} Region</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="font-display text-xl font-bold text-foreground">{selectedRegionData.avgRating}</p>
                        <p className="text-xs text-muted-foreground">Avg Rating</p>
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold text-foreground">{selectedRegionData.totalIssues}</p>
                        <p className="text-xs text-muted-foreground">Issues</p>
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold text-foreground">{selectedRegionData.resolvedPercent}%</p>
                        <p className="text-xs text-muted-foreground">Resolved</p>
                      </div>
                    </div>
                    <Progress value={selectedRegionData.resolvedPercent} className="h-2" />

                    {/* Show matching constituencies */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Constituencies</p>
                      {sampleConstituencies
                        .filter((c) => c.region === selectedRegionData.name)
                        .map((c) => (
                          <Link
                            key={c.id}
                            to={`/constituency/${c.id}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.mpName} • {c.totalIssues} issues</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-secondary fill-secondary" />
                                <span className="text-sm font-semibold text-foreground">{c.mpRating}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </Link>
                        ))}
                      {sampleConstituencies.filter((c) => c.region === selectedRegionData.name).length === 0 && (
                        <p className="text-xs text-muted-foreground py-4 text-center">No constituency data available for this region yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaders" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Top Performing Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...sampleLeaders]
                  .sort((a, b) => b.rating - a.rating)
                  .map((leader, i) => (
                    <Link
                      key={leader.id}
                      to={`/leader/${leader.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-display text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{leader.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.constituency || leader.district} • {leader.party}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                          <span className="font-semibold text-foreground">{leader.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{leader.responseRate}% response</p>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-accent" /> Lowest Performing Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...sampleLeaders]
                  .sort((a, b) => a.rating - b.rating)
                  .map((leader, i) => (
                    <Link
                      key={leader.id}
                      to={`/leader/${leader.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-display text-lg font-bold text-accent w-6">{i + 1}</span>
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-accent">{leader.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.constituency || leader.district} • {leader.party}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                          <span className="font-semibold text-foreground">{leader.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{leader.responseRate}% response</p>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* National Issue Heatmap */}
          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Most Reported Issue Categories — National</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBreakdown
                  .sort((a, b) => b.count - a.count)
                  .map((cat, i) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{cat.icon} {cat.name}</span>
                        <span className="text-sm font-bold text-foreground">{cat.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage * 3}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                        />
                      </div>
                    </motion.div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent" /> Critical Unresolved Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sampleIssues
                  .filter((i) => i.urgency === "critical" && i.status !== "resolved")
                  .map((issue) => (
                    <Link
                      key={issue.id}
                      to={`/issue/${issue.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.constituency} • {issue.daysOpen} days open</p>
                      </div>
                      <Badge variant="destructive" className="text-xs shrink-0">Critical</Badge>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Leaders */}
          <TabsContent value="flagged" className="space-y-4">
            <Card className="border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent" /> Auto-Flagged Leaders
                </CardTitle>
                <p className="text-xs text-muted-foreground">Leaders with response rate below 20% or rating below 2 stars</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {flaggedLeaders.map((leader, i) => (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-lg border border-accent/20 bg-accent/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-accent">{leader.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{leader.name}</p>
                          <p className="text-xs text-muted-foreground">{leader.role.toUpperCase()} • {leader.constituency || leader.district}</p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">⚠ Flagged</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-accent">{leader.rating}</p>
                        <p className="text-[10px] text-muted-foreground">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-accent">{leader.responseRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Response Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-foreground">{leader.avgResponseTime}</p>
                        <p className="text-[10px] text-muted-foreground">Avg Response</p>
                      </div>
                    </div>
                    <p className="text-xs text-accent font-medium">Reason: {leader.flagReason}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default PresidentialDashboard;
