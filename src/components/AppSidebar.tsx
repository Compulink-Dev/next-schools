// components/app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { LMSLogo } from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  UserCog,
  GraduationCap,
  Users,
  BookOpen,
  School,
  BookText,
  ClipboardList,
  FileText,
  BarChart3,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  User,
  Settings,
  LogOut,
  type LucideIcon,
  BadgeDollarSignIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  visible: string[];
  exact?: boolean;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "MAIN",
    items: [
      {
        icon: Home,
        label: "Dashboard",
        href: "/admin",
        visible: ["admin", "teacher", "student", "parent"],
        exact: true,
        badge: "✨",
      },
      {
        icon: BarChart3,
        label: "Analytics",
        href: "/analytics",
        visible: ["admin", "teacher"],
        badge: "New",
      },
    ],
  },
  {
    title: "ACADEMICS",
    items: [
      {
        icon: UserCog,
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: GraduationCap,
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: Users,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: BookOpen,
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: School,
        label: "Grades & Classes",
        href: "/list/grades",
        visible: ["admin"],
      },
      {
        icon: BookText,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
    ],
  },
  {
    title: "ASSESSMENTS",
    items: [
      {
        icon: ClipboardList,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: FileText,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: BarChart3,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        icon: CalendarCheck,
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: CalendarCheck,
        label: "Calendar",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: BadgeDollarSignIcon,
        label: "Fee Management",
        href: "/list/fees",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: MessageSquare,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
        badge: "3",
      },
      {
        icon: Megaphone,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;
  const { state } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm"
    >
      <SidebarHeader className="border-b p-6">
        <Link
          href="/admin"
          className="flex items-center gap-3 font-semibold group"
        >
          <div className="relative">
            <LMSLogo size={36} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-background" />
          </div>
          <div
            className={cn(
              "flex flex-col transition-all duration-300",
              state === "expanded" ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}
          >
            <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              LMS Platform
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              Education Management
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.visible.includes(role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.title} className="mb-6 last:mb-0">
              {state === "expanded" && (
                <SidebarGroupLabel className="px-3 pt-2 pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isExactMatch = pathname === item.href;
                    const isActive = item.exact
                      ? isExactMatch
                      : pathname.startsWith(item.href);

                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "group relative transition-all duration-200 hover:translate-x-1",
                            isActive
                              ? "bg-gradient-to-r from-primary/10 to-primary/5 border-r-2 border-primary shadow-sm"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 py-3 px-3 rounded-lg"
                          >
                            <div
                              className={cn(
                                "relative transition-colors duration-200",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}
                            >
                              <item.icon size={20} />
                              {isActive && (
                                <div className="absolute -inset-1 bg-primary/10 rounded-full animate-pulse" />
                              )}
                            </div>

                            <div
                              className={cn(
                                "flex items-center justify-between flex-1 transition-all duration-300",
                                state === "expanded"
                                  ? "opacity-100 w-auto"
                                  : "opacity-0 w-0"
                              )}
                            >
                              <span
                                className={cn(
                                  "font-medium transition-colors",
                                  isActive ? "text-primary" : "text-foreground"
                                )}
                              >
                                {item.label}
                              </span>

                              {item.badge && (
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 text-xs rounded-full font-medium",
                                    item.badge === "New"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                      : item.badge === "✨"
                                      ? "text-yellow-500"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            {state === "expanded" && (
                              <ChevronRight
                                size={16}
                                className={cn(
                                  "text-muted-foreground transition-transform duration-200",
                                  isActive
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                )}
                              />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-4 bg-gradient-to-t from-accent/30 to-transparent">
        <div className="flex items-center gap-3 p-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
          </div>

          <div
            className={cn(
              "flex flex-col transition-all duration-300 overflow-hidden",
              state === "expanded" ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}
          >
            <span className="text-sm font-semibold truncate">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              <Sparkles size={10} className="text-yellow-500" />
              {role}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            "grid grid-cols-3 gap-2 mt-3 transition-all duration-300",
            state === "expanded" ? "opacity-100 h-auto" : "opacity-0 h-0"
          )}
        >
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <User size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Profile</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Settings size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Settings</span>
          </Link>
          <Link
            href="/logout"
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <LogOut size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Logout</span>
          </Link>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
