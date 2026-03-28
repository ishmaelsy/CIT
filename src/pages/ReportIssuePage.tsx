import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X, MapPin, AlertTriangle, Send, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { categories, regions, sampleIssues } from "@/data/sampleData";
import { useCreateIssue } from "@/hooks/useIssues";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  SUPPORTED_LANGUAGES,
  isKhayaConfigured,
  translateText,
  getDefaultLanguageForRegion,
  type KhayaLangCode,
} from "@/lib/khaya";
import { Languages } from "lucide-react";

const urgencyLevels = [
  { value: "low", label: "Low", color: "bg-urgency-low", desc: "Minor inconvenience" },
  { value: "medium", label: "Medium", color: "bg-urgency-medium", desc: "Needs attention soon" },
  { value: "high", label: "High", color: "bg-urgency-high", desc: "Affecting daily life" },
  { value: "critical", label: "Critical", color: "bg-urgency-critical", desc: "Dangerous / emergency" },
];

const sampleDistricts: Record<string, string[]> = {
  Ashanti: ["Kumasi Metropolitan", "Obuasi Municipal", "Ejisu Municipal"],
  "Greater Accra": ["Accra Metropolitan", "Tema Metropolitan", "Ga South Municipal"],
  Northern: ["Tamale Metropolitan", "Sagnarigu Municipal", "Yendi Municipal"],
  Western: ["Sekondi-Takoradi Metropolitan", "Tarkwa-Nsuaem Municipal"],
  Bono: ["Sunyani Municipal", "Dormaa Municipal"],
};

const sampleConstituencies: Record<string, string[]> = {
  "Kumasi Metropolitan": ["Kumasi Central", "Manhyia North", "Manhyia South", "Subin", "Bantama"],
  "Accra Metropolitan": ["Accra Central", "Ablekuma South", "Odododiodio", "Okaikwei Central"],
  "Tamale Metropolitan": ["Tamale Central", "Tamale South", "Sagnarigu"],
  "Sekondi-Takoradi Metropolitan": ["Takoradi", "Sekondi", "Effia"],
  "Sunyani Municipal": ["Sunyani", "Sunyani East"],
};

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const createIssue = useCreateIssue();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState(profile?.region || "");
  const [district, setDistrict] = useState("");
  const [constituency, setConstituency] = useState(profile?.constituency || "");
  const [landmark, setLandmark] = useState("");
  const [urgency, setUrgency] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [writingInLocal, setWritingInLocal] = useState(false);
  const [localLang, setLocalLang] = useState<KhayaLangCode>(
    () =>
      (localStorage.getItem("cit_preferred_lang") as KhayaLangCode) ||
      (profile?.region ? getDefaultLanguageForRegion(profile.region) : null) ||
      "tw"
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];
    const urls: string[] = [];

    for (const photo of photos) {
      const ext = photo.file.name.split(".").pop() || "jpg";
      const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("issue-photos").upload(path, photo.file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("issue-photos").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to report an issue");
      navigate("/auth");
      return;
    }
    if (!title.trim() || !description.trim() || !category || !urgency) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!region || !constituency) {
      toast.error("Please select your location");
      return;
    }
    // Check for duplicates
    const possibleDuplicates = sampleIssues.filter(
      (issue) =>
        issue.category === category &&
        (issue.title.toLowerCase().includes(title.toLowerCase().split(" ")[0]) ||
          issue.constituency === constituency)
    );
    if (possibleDuplicates.length > 0 && !showDuplicates) {
      setShowDuplicates(true);
      return;
    }

    setUploading(true);
    try {
      let finalTitle = title.trim();
      let finalDescription = description.trim();

      if (writingInLocal && isKhayaConfigured()) {
        toast.info("Translating your submission to English...");
        const [enTitle, enDesc] = await Promise.all([
          translateText(finalTitle, localLang, "local-to-en"),
          translateText(finalDescription, localLang, "local-to-en"),
        ]);
        finalTitle = enTitle;
        finalDescription = `${enDesc}\n\n[Original (${SUPPORTED_LANGUAGES.find((l) => l.code === localLang)?.name}): ${description.trim()}]`;
      }

      const imageUrls = await uploadPhotos();
      createIssue.mutate(
        {
          title: finalTitle,
          description: finalDescription,
          category,
          region,
          district: district || region,
          constituency,
          urgency,
          image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        },
        {
          onSuccess: () => {
            setSubmitted(true);
            setTimeout(() => navigate("/feed"), 1500);
          },
        }
      );
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const availableDistricts = region ? sampleDistricts[region] || [] : [];
  const availableConstituencies = district ? sampleConstituencies[district] || [] : [];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Issue Reported!</h2>
          <p className="text-muted-foreground">Your issue has been submitted and tagged to your constituency.</p>
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
          <h1 className="font-display text-lg font-bold text-foreground">Report an Issue</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {!user && (
          <Card className="border-secondary/30 bg-secondary/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-foreground">
                Please <Link to="/auth" className="text-primary font-semibold hover:underline">sign in</Link> to report an issue.
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
            Issue Title *
            {writingInLocal && <span className="text-xs font-normal text-muted-foreground ml-1.5">(in {SUPPORTED_LANGUAGES.find((l) => l.code === localLang)?.name})</span>}
          </Label>
          <Input id="title" placeholder={writingInLocal ? "Type in your language — auto-translated on submit" : "e.g. Broken streetlights on main road"} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          <p className="text-xs text-muted-foreground">{title.length}/120</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="desc" className="text-sm font-semibold">
            Description *
            {writingInLocal && <span className="text-xs font-normal text-muted-foreground ml-1.5">(in {SUPPORTED_LANGUAGES.find((l) => l.code === localLang)?.name})</span>}
          </Label>
          <Textarea id="desc" placeholder={writingInLocal ? "Describe in your language — auto-translated on submit" : "Describe the issue in detail..."} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px]" maxLength={2000} />
          <p className="text-xs text-muted-foreground">{description.length}/2000</p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Category *</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat.name} variant={category === cat.name ? "default" : "outline"} className="cursor-pointer px-3 py-1.5 text-sm" onClick={() => setCategory(cat.name)}>
                {cat.icon} {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={region} onValueChange={(v) => { setRegion(v); setDistrict(""); setConstituency(""); }}>
              <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
              <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={district} onValueChange={(v) => { setDistrict(v); setConstituency(""); }} disabled={!region}>
              <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent>{availableDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={constituency} onValueChange={setConstituency} disabled={!district}>
              <SelectTrigger><SelectValue placeholder="Select Constituency" /></SelectTrigger>
              <SelectContent>{availableConstituencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Nearest landmark (optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Photos (up to 5)</Label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <div className="flex gap-3 flex-wrap">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                <img src={photo.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[10px]">Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Urgency Level *</Label>
          <div className="grid grid-cols-2 gap-2">
            {urgencyLevels.map((level) => (
              <button key={level.value} onClick={() => setUrgency(level.value)} className={`p-3 rounded-lg border-2 text-left transition-all ${urgency === level.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${level.color}`} />
                  <span className="font-semibold text-sm text-foreground">{level.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Detection */}
        <AnimatePresence>
          {showDuplicates && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <Card className="border-secondary">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">⚠️ Others have reported similar issues — join theirs instead?</p>
                  {sampleIssues.filter((i) => i.category === category).slice(0, 2).map((issue) => (
                    <Link key={issue.id} to={`/issue/${issue.id}`} className="block p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                      <p className="text-sm font-medium text-foreground">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{issue.meTooCount} people reported • {issue.constituency}</p>
                    </Link>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setShowDuplicates(false)}>No, submit my own report</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <Button className="w-full h-12 text-base font-semibold" onClick={handleSubmit} disabled={uploading || createIssue.isPending}>
          {uploading ? "Uploading photos..." : createIssue.isPending ? "Submitting..." : (
            <><Send className="w-5 h-5 mr-2" /> Submit Issue Report</>
          )}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportIssuePage;
