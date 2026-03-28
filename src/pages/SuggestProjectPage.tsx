import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Lightbulb, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { categories, regions } from "@/data/sampleData";
import { useCreateProject } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import {
  SUPPORTED_LANGUAGES,
  isKhayaConfigured,
  translateText,
  getDefaultLanguageForRegion,
  type KhayaLangCode,
} from "@/lib/khaya";
import { Languages } from "lucide-react";

const sampleDistricts: Record<string, string[]> = {
  Ashanti: ["Kumasi Metropolitan", "Obuasi Municipal", "Ejisu Municipal"],
  "Greater Accra": [
    "Accra Metropolitan",
    "Tema Metropolitan",
    "Ga South Municipal",
  ],
  Northern: [
    "Tamale Metropolitan",
    "Sagnarigu Municipal",
    "Yendi Municipal",
  ],
  Western: [
    "Sekondi-Takoradi Metropolitan",
    "Tarkwa-Nsuaem Municipal",
  ],
  Bono: ["Sunyani Municipal", "Dormaa Municipal"],
};

const sampleConstituencies: Record<string, string[]> = {
  "Kumasi Metropolitan": [
    "Kumasi Central",
    "Manhyia North",
    "Manhyia South",
    "Subin",
    "Bantama",
  ],
  "Accra Metropolitan": [
    "Accra Central",
    "Ablekuma South",
    "Odododiodio",
    "Okaikwei Central",
  ],
  "Tamale Metropolitan": ["Tamale Central", "Tamale South", "Sagnarigu"],
  "Sekondi-Takoradi Metropolitan": ["Takoradi", "Sekondi", "Effia"],
  "Sunyani Municipal": ["Sunyani", "Sunyani East"],
};

const SuggestProjectPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const createProject = useCreateProject();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState(profile?.region || "");
  const [district, setDistrict] = useState(profile?.district || "");
  const [constituency, setConstituency] = useState(
    profile?.constituency || ""
  );
  const [estimatedImpact, setEstimatedImpact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [writingInLocal, setWritingInLocal] = useState(false);
  const [localLang, setLocalLang] = useState<KhayaLangCode>(
    () =>
      (localStorage.getItem("cit_preferred_lang") as KhayaLangCode) ||
      (profile?.region ? getDefaultLanguageForRegion(profile.region) : null) ||
      "tw"
  );

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to suggest a project");
      navigate("/auth");
      return;
    }
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!region || !constituency) {
      toast.error("Please select the project location");
      return;
    }

    setSubmitting(true);
    try {
      let finalTitle = title.trim();
      let finalDescription = description.trim();
      let finalImpact = estimatedImpact.trim() || undefined;

      if (writingInLocal && isKhayaConfigured()) {
        toast.info("Translating your submission to English...");
        const langName = SUPPORTED_LANGUAGES.find((l) => l.code === localLang)?.name;
        const [enTitle, enDesc, enImpact] = await Promise.all([
          translateText(finalTitle, localLang, "local-to-en"),
          translateText(finalDescription, localLang, "local-to-en"),
          finalImpact
            ? translateText(finalImpact, localLang, "local-to-en")
            : Promise.resolve(undefined),
        ]);
        finalTitle = enTitle;
        finalDescription = `${enDesc}\n\n[Original (${langName}): ${description.trim()}]`;
        if (enImpact) finalImpact = enImpact;
      }

      createProject.mutate(
        {
          title: finalTitle,
          description: finalDescription,
          category,
          region,
          district: district || region,
          constituency,
          estimated_impact: finalImpact,
        },
        {
          onSuccess: () => {
            setSubmitted(true);
            setTimeout(() => navigate("/projects"), 1500);
          },
        }
      );
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const availableDistricts = region ? sampleDistricts[region] || [] : [];
  const availableConstituencies = district
    ? sampleConstituencies[district] || []
    : [];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Project Suggested!
          </h2>
          <p className="text-muted-foreground">
            Your project has been submitted. Others can now vote to push it up
            the priority list.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <TopNav />

      <header className="sticky top-0 md:top-14 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-lg font-bold text-foreground">
            Suggest a Project
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {!user && (
          <Card className="border-secondary/30 bg-secondary/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-foreground">
                Please{" "}
                <Link
                  to="/auth"
                  className="text-primary font-semibold hover:underline"
                >
                  sign in
                </Link>{" "}
                to suggest a project.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Local language toggle */}
        {isKhayaConfigured() && (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 border border-border rounded-sm bg-card">
            <div className="flex items-center gap-2 text-sm">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Write in local language</span>
            </div>
            <div className="flex items-center gap-2">
              {writingInLocal && (
                <Select value={localLang} onValueChange={(v) => setLocalLang(v as KhayaLangCode)}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={writingInLocal}
                onClick={() => setWritingInLocal(!writingInLocal)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${writingInLocal ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${writingInLocal ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold">
            Project Title *
            {writingInLocal && <span className="text-xs font-normal text-muted-foreground ml-1.5">(in {SUPPORTED_LANGUAGES.find((l) => l.code === localLang)?.name})</span>}
          </Label>
          <Input
            id="title"
            placeholder={writingInLocal ? "Type in your language — auto-translated on submit" : "e.g. Build community borehole at Nima Market"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <p className="text-xs text-muted-foreground">{title.length}/120</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="desc" className="text-sm font-semibold">
            Description *
            {writingInLocal && <span className="text-xs font-normal text-muted-foreground ml-1.5">(in {SUPPORTED_LANGUAGES.find((l) => l.code === localLang)?.name})</span>}
          </Label>
          <Textarea
            id="desc"
            placeholder={writingInLocal ? "Describe in your language — auto-translated on submit" : "Explain the project — what it is, who it benefits, why it matters..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/2000
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Category *</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.name}
                variant={category === cat.name ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setCategory(cat.name)}
              >
                {cat.icon} {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Target Location *
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              value={region}
              onValueChange={(v) => {
                setRegion(v);
                setDistrict("");
                setConstituency("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={district}
              onValueChange={(v) => {
                setDistrict(v);
                setConstituency("");
              }}
              disabled={!region}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={constituency}
              onValueChange={setConstituency}
              disabled={!district}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Constituency" />
              </SelectTrigger>
              <SelectContent>
                {availableConstituencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estimated impact */}
        <div className="space-y-2">
          <Label htmlFor="impact" className="text-sm font-semibold">
            Estimated Impact (optional)
          </Label>
          <Textarea
            id="impact"
            placeholder="How many people will benefit? What problem does it solve? Any cost estimates?"
            value={estimatedImpact}
            onChange={(e) => setEstimatedImpact(e.target.value)}
            className="min-h-[80px]"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {estimatedImpact.length}/1000
          </p>
        </div>

        {/* Submit */}
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={createProject.isPending || submitting}
        >
          {createProject.isPending || submitting ? (
            submitting && writingInLocal ? "Translating & submitting..." : "Submitting..."
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" /> Submit Project Suggestion
            </>
          )}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default SuggestProjectPage;
