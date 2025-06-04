"use client";
import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  DollarSign,
  FilePlus,
  Users,
  Settings,
  X,
  NotebookText,
} from "lucide-react";
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export function Sidebar({ open, setOpen }: SidebarProps) {
  const navigation = [
    {
      name: "Dashboard",
      href: "#",
      icon: LayoutDashboard,
      current: true,
    },
    {
      name: "My Courses",
      href: "#",
      icon: BookOpen,
      current: false,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: NotebookText,
      current: false,
    },
    {
      name: "Orders",
      href: "#",
      icon: ShoppingCart,
      current: false,
    },
    {
      name: "Revenue",
      href: "#",
      icon: DollarSign,
      current: false,
    },
    {
      name: "Create Course",
      href: "#",
      icon: FilePlus,
      current: false,
    },
    {
      name: "Students",
      href: "#",
      icon: Users,
      current: false,
    },
    {
      name: "Settings",
      href: "#",
      icon: Settings,
      current: false,
    },
  ];
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
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="ml-2 font-semibold text-lg">Course Master</span>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                item.current
                  ? "bg-muted text-primary"
                  : "text-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col border-r border-border bg-background">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="ml-2 font-semibold text-lg">Course Master</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  item.current
                    ? "bg-muted text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
