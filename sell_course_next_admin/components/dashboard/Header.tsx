"use client";
import React from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
interface HeaderProps {
  onMenuClick: () => void;
}
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center md:hidden">
          <button
            className="text-foreground p-2 rounded-md"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-between md:justify-end">
          <div className="max-w-md w-full hidden md:block mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 relative">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <div className="ml-3 relative">
              <div className="flex items-center">
                <button className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    JD
                  </div>
                  <span className="hidden md:flex ml-2 text-sm font-medium">
                    John Doe
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
