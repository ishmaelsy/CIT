import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import FeedPage from "./pages/FeedPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LeaderProfilePage from "./pages/LeaderProfilePage";
import PriorityBoardPage from "./pages/PriorityBoardPage";
import ConstituencyPage from "./pages/ConstituencyPage";
import ReportIssuePage from "./pages/ReportIssuePage";
import NotificationsPage from "./pages/NotificationsPage";
import PresidentialDashboard from "./pages/PresidentialDashboard";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OfficialDashboard from "./pages/OfficialDashboard";
import MyConstituencyPage from "./pages/MyConstituencyPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/issue/:id" element={<IssueDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/leader/:id" element={<LeaderProfilePage />} />
            <Route path="/priority-board" element={<PriorityBoardPage />} />
            <Route path="/constituency/:id" element={<ConstituencyPage />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/national-map" element={<PresidentialDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/official-dashboard" element={<OfficialDashboard />} />
            <Route path="/my-constituency" element={<MyConstituencyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
