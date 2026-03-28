import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, MessageCircle, ThumbsUp, AlertTriangle, CheckCircle, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: string;
  type: "response" | "vote" | "comment" | "issue" | "rating" | "metoo";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link: string;
}

const sampleNotifications: Notification[] = [
  {
    id: "1", type: "response", title: "Official Response",
    message: "Hon. Ama Darko responded to 'No water supply in Nima for 3 weeks'",
    time: "2 hours ago", read: false, link: "/issue/2",
  },
  {
    id: "2", type: "vote", title: "Issue Upvoted",
    message: "Your issue 'Massive potholes on Kumasi-Accra Highway' received 15 new upvotes",
    time: "5 hours ago", read: false, link: "/issue/1",
  },
  {
    id: "3", type: "metoo", title: "Me Too Report",
    message: "12 more people reported the same water issue in your constituency",
    time: "8 hours ago", read: false, link: "/issue/2",
  },
  {
    id: "4", type: "comment", title: "New Comment",
    message: "Kwame Asante commented on 'School building collapsing in Sunyani'",
    time: "1 day ago", read: true, link: "/issue/5",
  },
  {
    id: "5", type: "issue", title: "New Issue Nearby",
    message: "A new critical issue was reported in Accra Central: 'Hospital beds shortage at Korle Bu'",
    time: "1 day ago", read: true, link: "/issue/6",
  },
  {
    id: "6", type: "rating", title: "Leader Rating Updated",
    message: "Hon. Kwadwo Mensah's rating dropped to 3.2 stars in Kumasi Central",
    time: "2 days ago", read: true, link: "/leader/1",
  },
  {
    id: "7", type: "response", title: "Issue Resolved",
    message: "The flooding issue at Takoradi Market Circle has been marked as 'In Progress'",
    time: "3 days ago", read: true, link: "/issue/4",
  },
  {
    id: "8", type: "vote", title: "Priority Board Update",
    message: "Your voted issue 'Streetlights broken on Tamale-Bolgatanga road' is now #2 on the priority board",
    time: "3 days ago", read: true, link: "/priority-board",
  },
];

const iconMap: Record<string, typeof Bell> = {
  response: CheckCircle,
  vote: ThumbsUp,
  comment: MessageCircle,
  issue: AlertTriangle,
  rating: Star,
  metoo: Users,
};

const colorMap: Record<string, string> = {
  response: "text-primary",
  vote: "text-secondary",
  comment: "text-muted-foreground",
  issue: "text-accent",
  rating: "text-secondary",
  metoo: "text-primary",
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(sampleNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filterByTab = (tab: string) => {
    if (tab === "all") return notifications;
    if (tab === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === tab);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-lg font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-accent text-accent-foreground text-xs">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-primary">
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="response">Responses</TabsTrigger>
            <TabsTrigger value="vote">Votes</TabsTrigger>
          </TabsList>

          {["all", "unread", "response", "vote"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-2">
              {filterByTab(tab).length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications here.</p>
                </div>
              ) : (
                filterByTab(tab).map((notification, i) => {
                  const Icon = iconMap[notification.type] || Bell;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
                        );
                        navigate(notification.link);
                      }}
                      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.read ? "bg-background hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className={`mt-0.5 ${colorMap[notification.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-accent rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
