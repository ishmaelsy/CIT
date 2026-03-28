import { Link, useLocation } from "react-router-dom";
import { Home, BarChart3, Award, Bell, MapPin, LogIn, LogOut, Plus, User, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const TopNav = () => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { data: roleData } = useUserRole();

  const navLinks = [
    { to: "/feed", label: "Feed", icon: Home },
    { to: "/my-constituency", label: "My Area", icon: MapPin },
    { to: "/priority-board", label: "Priority Board", icon: BarChart3 },
    { to: "/leaderboard", label: "Leaderboard", icon: Award },
    { to: "/notifications", label: "Notifications", icon: Bell },
    ...(roleData?.isOfficial ? [{ to: "/official-dashboard", label: "Official", icon: Shield }] : []),
    ...(roleData?.isAdmin ? [{ to: "/admin", label: "Admin", icon: Settings }] : []),
    { to: "/national-map", label: "Dashboard", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border hidden md:block">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🇬🇭</span>
          <span className="font-display font-bold text-foreground text-lg">Ghana CIT</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.to || pathname.startsWith(link.to + "/");
            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link to="/report">
                <Button size="sm" variant="secondary" className="text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Report
                </Button>
              </Link>
              <Link to="/profile">
                <Button size="sm" variant="ghost" className="text-xs gap-1">
                  <User className="w-3.5 h-3.5" /> Profile
                </Button>
              </Link>
            </>
          )}
          {user ? (
            <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline" className="text-xs gap-1">
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
