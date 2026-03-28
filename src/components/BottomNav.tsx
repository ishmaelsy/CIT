import { Link, useLocation } from "react-router-dom";
import { Home, Award, BarChart3, Bell, User, MapPin, Lightbulb } from "lucide-react";

const navItems = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/projects", label: "Projects", icon: Lightbulb },
  { to: "/my-constituency", label: "My Area", icon: MapPin },
  { to: "/leaderboard", label: "Leaders", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
