// app/dashboard/layout.tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F7F8FA] overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
