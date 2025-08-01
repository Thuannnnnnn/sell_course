"use client";

import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import logo from "../../public/logo.png";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import LogoutButton from "../ui/LogoutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { settingsApi } from "../../lib/api/settingsApi";
import { NotificationBell } from "../notifications/NotificationBell";

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchActiveLogo() {
      try {
        const version = await settingsApi.getActiveVersion();
        if (!version?.versionSettingId) {
          setLogoUrl(undefined);
          return;
        }
        const logos = await settingsApi.getLogoByVersionId(
          version.versionSettingId
        );
        setLogoUrl(logos[0]?.logo);
      } catch (error) {
        setLogoUrl(undefined);
        console.error("Failed to fetch active version or logo:", error);
      }
    }
    fetchActiveLogo();
  }, []);

  useEffect(() => {
    if (session?.expires) {
      const expireTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      if (currentTime >= expireTime) {
        signOut().then(() => {});
      } else {
        const timeout = setTimeout(() => {
          signOut().then(() => {});
        }, expireTime - currentTime);
        return () => clearTimeout(timeout);
      }
    }
  }, [session]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            className="w-12 h-12 rounded-full overflow-hidden"
            src={logoUrl || logo}
            alt={"logo"}
            width={80}
            height={80}
          />
          <span className="font-bold text-xl">Course Master</span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                href="/"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                href="/courses"
              >
                Courses
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                href="/about"
              >
                About Us
              </NavigationMenuLink>
            </NavigationMenuItem>
                      </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <NotificationBell
                userId={session?.user?.id || ""}
                userRole={session?.user?.role || "USER"}
              />
              <div className="relative">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={session?.user?.avatarImg}
                          alt="@user"
                        />
                        <AvatarFallback>
                          {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 mr-4"
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    alignOffset={-4}
                    avoidCollisions={true}
                    collisionBoundary={[]}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session?.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
