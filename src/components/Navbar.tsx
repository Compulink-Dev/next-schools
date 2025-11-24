// components/Navbar.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Mail,
  Search,
  Calendar,
  Settings,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { user } = useUser();

  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState({
    messages: 0,
    announcements: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [messagesRes, announcementsRes] = await Promise.all([
          fetch("/api/messages?limit=5"),
          fetch("/api/announcements?limit=5"),
        ]);

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData);
          setUnreadCount((prev) => ({
            ...prev,
            messages: messagesData.filter((m: any) => !m.read).length,
          }));
        }

        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData);
          setUnreadCount((prev) => ({
            ...prev,
            announcements: announcementsData.filter((a: any) => !a.read).length,
          }));
        }
      } catch (error) {
        console.error("Error fetching navbar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = () => {
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b supports-backdrop-blur:bg-white/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden hover:bg-accent transition-colors" />

        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search students, classes, assignments..."
            className="w-[280px] pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-2xl focus:bg-background transition-all duration-200 focus:w-[320px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-9 w-9 p-0"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-9 w-9 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-9 w-9 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative rounded-full h-9 w-9 p-0 hover:bg-accent/50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              {unreadCount.messages > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {unreadCount.messages > 9 ? "9+" : unreadCount.messages}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Messages</span>
              {unreadCount.messages > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount.messages} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <DropdownMenuItem
                disabled
                className="flex flex-col items-center py-4 text-muted-foreground"
              >
                <Mail className="h-8 w-8 mb-2 opacity-50" />
                No messages
              </DropdownMenuItem>
            ) : (
              messages.map((message) => (
                <DropdownMenuItem
                  key={message.id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer transition-colors",
                    !message.read && "bg-accent/50 border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={message.sender?.imageUrl} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {message.sender?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {message.title}
                        </span>
                        {!message.read && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {message.content}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="text-center justify-center py-2"
            >
              <Link
                href="/list/messages"
                className="w-full text-primary font-medium"
              >
                View all messages
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative rounded-full h-9 w-9 p-0 hover:bg-accent/50 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount.announcements > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {unreadCount.announcements > 9
                    ? "9+"
                    : unreadCount.announcements}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Announcements</span>
              {unreadCount.announcements > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount.announcements} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            ) : announcements.length === 0 ? (
              <DropdownMenuItem
                disabled
                className="flex flex-col items-center py-4 text-muted-foreground"
              >
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                No announcements
              </DropdownMenuItem>
            ) : (
              announcements.map((announcement) => (
                <DropdownMenuItem
                  key={announcement.id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer transition-colors",
                    !announcement.read &&
                      "bg-accent/50 border-l-2 border-l-blue-500"
                  )}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {announcement.title}
                        </span>
                        {!announcement.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {announcement.content}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(announcement.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="text-center justify-center py-2"
            >
              <Link
                href="/list/announcements"
                className="w-full text-primary font-medium"
              >
                View all announcements
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold leading-4">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.publicMetadata?.role as string}
            </span>
          </div>

          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-9 w-9 ring-2 ring-primary/10 hover:ring-primary/20 transition-all",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
