// components/Navbar.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { AlertCircle, Bell, Mail } from "lucide-react";
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
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const { user } = useUser();

  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // fetch latest 5 messages and announcements
    const fetchData = async () => {
      try {
        const [m, a] = await Promise.all([
          fetch("/api/messages?limit=5").then((r) => r.json()),
          fetch("/api/announcements?limit=5").then((r) => r.json()),
        ]);
        setMessages(m);
        setAnnouncements(a);
      } catch (_) {}
    };
    fetchData();
  }, []);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />

        <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
          <Image src="/search.png" alt="" width={14} height={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] p-2 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
              <Mail size={16} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Recent Messages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {messages.length === 0 && (
              <DropdownMenuItem disabled>No messages</DropdownMenuItem>
            )}
            {messages.map((m) => (
              <DropdownMenuItem key={m.id} className="flex flex-col items-start">
                <span className="font-medium text-sm truncate w-full">{m.title}</span>
                <span className="text-xs text-gray-500 truncate w-full">{m.content}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/list/messages" className="w-full text-center">
                Show more
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
              <Bell size={16} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Announcements</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {announcements.length === 0 && (
              <DropdownMenuItem disabled>No announcements</DropdownMenuItem>
            )}
            {announcements.map((a) => (
              <DropdownMenuItem key={a.id} className="flex flex-col items-start">
                <span className="font-medium text-sm truncate w-full">{a.title}</span>
                <span className="text-xs text-gray-500 truncate w-full">{new Date(a.date).toLocaleString()}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/list/announcements" className="w-full text-center">
                Show more
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
