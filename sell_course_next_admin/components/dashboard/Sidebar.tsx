"use client";
import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  X,
  NotebookText,
  Tag,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { settingsApi } from "../../app/api/settings/settings";
import { useSession } from "next-auth/react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  logoUrl?: string; // thêm prop này
  versionId?: string; // Thêm prop này để nhận versionId
}

export function Sidebar({ open, setOpen, versionId, logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [defaultLogo, setDefaultLogo] = useState<string | undefined>(undefined);
  const { data: session } = useSession();
  const role = session?.user?.role;
  useEffect(() => {
    async function initVersionAndLogo() {
      try {
        let vId = versionId;
        if (!vId) {
          const activeVersion = await settingsApi.getActiveVersion();
          vId = activeVersion?.versionSettingId;
        }
        if (vId) {
          const logos = await settingsApi.getLogoByVersionId(vId);
          setDefaultLogo(logos[0]?.logo);
        }
      } catch (e) {
        console.warn('Sidebar: failed to load active version/logo', e);
      }
    }
    initVersionAndLogo();
  }, [versionId]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      roles: ["ADMIN"],
    },
    {
      name: "Courses",
      href: "/course",
      icon: BookOpen,
      roles: ["COURSEREVIEWER", "INSTRUCTOR"],
    },
    {
      name: "Categories",
      href: "/categories",
      icon: NotebookText,
      roles: ["CONTENTMANAGER"],
    },
    {
      name: "Chat Support",
      href: "/chat-support",
      icon: MessageCircle,
      roles: ["SUPPORT"],
    },
    {
      name: "Promotions",
      href: "/promotion",
      icon: Tag,
      roles: ["MARKETINGMANAGER"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["MARKETINGMANAGER"],
    },
  ];
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(role || "admin")
  );
  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={logoUrl || defaultLogo || '/logo.png'}
                alt="Logo"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="ml-2 font-semibold text-lg">Course Master</span>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-muted text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col border-r border-border bg-background">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={logoUrl || defaultLogo || '/logo.png'}
                alt="Logo"
                width={45}
                height={45}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="ml-2 font-semibold text-lg">Course Master</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href; // Kiểm tra nếu đường dẫn hiện tại khớp với href
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-muted text-primary" // Nếu active, làm sáng menu
                      : "text-foreground hover:bg-muted hover:text-primary"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
