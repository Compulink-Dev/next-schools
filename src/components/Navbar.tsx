// components/Navbar.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { AlertCircle, Bell, Mail } from "lucide-react";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />

        {/* SEARCH BAR - Only show on larger screens */}
        <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
          <Image src="/search.png" alt="" width={14} height={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] p-2 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Mail size={16} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Bell size={16} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-blue-900 text-white rounded-full text-xs">
            1
          </div>
        </div>
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
