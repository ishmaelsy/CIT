import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ShareButtons = ({ title, url }: { title: string; url?: string }) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: "💬" },
    { label: "Twitter / X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: "🐦" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: "📘" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareLinks.map((l) => (
          <DropdownMenuItem key={l.label} asChild>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="gap-2">
              {l.icon} {l.label}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={copyLink}>📋 Copy Link</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
