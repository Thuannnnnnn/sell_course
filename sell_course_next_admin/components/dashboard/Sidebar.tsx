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
import Image from "next/image";
import logo from "../../public/logo.png"; // Adjust the path to your logo image
import { usePathname } from "next/navigation";
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Courses",
      href: "/courses",
      icon: BookOpen,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: NotebookText,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
    },
    {
      name: "Revenue",
      href: "/revenue",
      icon: DollarSign,
    },
    {
      name: "Create Course",
      href: "/create-course",
      icon: FilePlus,
    },
    {
      name: "Students",
      href: "/students",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
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
            <Image src={logo} alt="Logo" width={40} height={40} />
            <span className="ml-2 font-semibold text-lg">Course Master</span>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
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
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col border-r border-border bg-background">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <Image src={logo} alt="Logo" width={40} height={40} />
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
