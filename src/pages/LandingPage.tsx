import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, BarChart3, Shield, MapPin, Star, MessageCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-ghana.jpg";
import logo from "@/assets/ghana-star-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Ghana CIT" width={32} height={32} className="w-8 h-8" />
            <span className="font-display font-bold text-lg text-foreground">Ghana <span className="text-primary">CIT</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Issues</Link>
            <Link to="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Leaders</Link>
            <Link to="/priority-board" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Priority Board</Link>
            <Link to="/national-map" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile">My Profile</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/feed">Go to Feed</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Ghana cityscape" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero opacity-85" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground/90">Tracking 276 Constituencies Nationwide</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Your Voice.<br />
              Your Constituency.<br />
              <span className="text-secondary">Your Country.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-body mb-8 max-w-lg">
              Report issues, hold your leaders accountable, and shape the future of Ghana — one constituency at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="outline" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold text-base px-8" asChild>
                <Link to={user ? "/report" : "/auth"}>
                  Report an Issue <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold text-base px-8" asChild>
                <Link to="/leaderboard">Rate Your MP</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Issues Reported", value: "12,847", icon: MessageCircle },
              { label: "Constituencies", value: "276", icon: MapPin },
              { label: "Leaders Rated", value: "842", icon: Star },
              { label: "Issues Resolved", value: "3,421", icon: CheckCircle },
            ].map((stat) => (
              <div key={stat.label} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10">
                <stat.icon className="w-5 h-5 text-secondary mb-2" />
                <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Ghana CIT Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A simple, powerful system to connect citizens with their elected representatives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: "Report", desc: "Snap a photo, describe the issue, and tag your constituency.", color: "bg-primary text-primary-foreground" },
              { icon: Users, title: "Rally Support", desc: 'Other citizens upvote and "Me Too" to boost urgency.', color: "bg-secondary text-secondary-foreground" },
              { icon: Shield, title: "Leaders Respond", desc: "Your MP and officials are notified and must respond publicly.", color: "bg-accent text-accent-foreground" },
              { icon: BarChart3, title: "Track & Rate", desc: "Monitor progress and rate your leaders on their performance.", color: "bg-foreground text-background" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-ghana`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Step {i + 1}</div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Officials Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              For Leaders & Officials
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              MPs, Ministers, DCEs and Directors can use Ghana CIT to stay connected with their constituents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: TrendingUp, title: "Real-Time Issues", desc: "See issues in your constituency ranked by citizen urgency and magnitude score." },
              { icon: MessageCircle, title: "Verified Responses", desc: "Respond officially with a verified badge. Update issue status from Acknowledged to Resolved." },
              { icon: Star, title: "Public Accountability", desc: "Your response rate and citizen rating are public. Build trust through transparency." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of Ghanaians already holding their leaders accountable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="outline" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold text-base px-10" asChild>
                <Link to={user ? "/feed" : "/auth"}>Get Started — It's Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold text-base px-10" asChild>
                <Link to="/official-dashboard">I'm an Official</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logo} alt="Ghana CIT" width={28} height={28} className="w-7 h-7 invert" />
                <span className="font-display font-bold text-background">Ghana CIT</span>
              </div>
              <p className="text-background/50 text-sm">Empowering citizens to hold their leaders accountable. Built for the people of Ghana.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-background mb-3">Platform</h4>
              <div className="space-y-2">
                <Link to="/feed" className="block text-sm text-background/50 hover:text-background/80">Issue Feed</Link>
                <Link to="/leaderboard" className="block text-sm text-background/50 hover:text-background/80">Leader Ratings</Link>
                <Link to="/priority-board" className="block text-sm text-background/50 hover:text-background/80">Priority Board</Link>
                <Link to="/national-map" className="block text-sm text-background/50 hover:text-background/80">National Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-background mb-3">For Officials</h4>
              <div className="space-y-2">
                <Link to="/official-dashboard" className="block text-sm text-background/50 hover:text-background/80">Official Dashboard</Link>
                <Link to="/auth" className="block text-sm text-background/50 hover:text-background/80">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 pt-6">
            <p className="text-background/50 text-sm text-center">© 2026 Ghana Constituency Issue Tracker. Built for the people of Ghana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
