import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

interface CleanWorkspaceHeaderProps {
  teacherName: string;
}

export const CleanWorkspaceHeader = ({ teacherName }: CleanWorkspaceHeaderProps) => {
  const { open } = useSidebar();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 backdrop-blur-lg bg-white shadow-md">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Open Menu">
          <Menu className="h-5 w-5 text-gray-900 hover:text-black" />
          <span className="sr-only">Toggle Menu</span>
        </SidebarTrigger>
        
        <div className="relative">
          <Logo size="small" className="mx-2" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
        </div>
        
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">
            👋 {teacherName}
          </h1>
          <p className="text-xs text-gray-600 font-medium hidden md:block">Professional Dashboard ✨</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs border-gray-300 bg-gray-100 text-gray-900 font-semibold shadow-sm">
            👨‍🏫 Teacher
          </Badge>
        </div>
      </div>
    </header>
  );
};