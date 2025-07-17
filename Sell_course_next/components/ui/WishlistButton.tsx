"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { wishlistApi } from "@/app/api/wishlist/wishlist-api";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

interface WishlistButtonProps {
  courseId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function WishlistButton({
  courseId,
  className = "",
  size = "md",
  showText = false,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;
  const token = session?.accessToken;

  // Handle session expiration
  useEffect(() => {
    if (session?.expires) {
      const expireTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      if (currentTime >= expireTime) {
        signOut();
      } else {
        const timeout = setTimeout(() => {
          signOut();
        }, expireTime - currentTime);
        return () => clearTimeout(timeout);
      }
    }
  }, [session]);

  // Check if course is already in wishlist
  const checkWishlistStatus = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const wishlist = await wishlistApi.getWishlist(userId, token);
      const isInList = wishlist.some((item) => item.courseId === courseId);
      setIsInWishlist(isInList);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      toast({
        title: "Error",
        description: "Unable to fetch wishlist.",
        variant: "destructive",
      });
    }
  }, [courseId, userId, token, toast]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  const handleWishlistToggle = async () => {
    setError(null);
    if (!userId || !token) {
      toast({
        title: "Unauthorized",
        description: "Please log in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(courseId, token);
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          description: "This course was removed from your wishlist.",
        });
      } else {
        await wishlistApi.addToWishlist(
          { userId, courseId, save: true },
          token
        );
        setIsInWishlist(true);
        toast({
          title: "Added to Wishlist",
          description: "This course was added to your wishlist.",
        });
      }
    } catch (error: unknown) {
      console.error("Wishlist error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  return (
    <div>
      <Button
        variant={isInWishlist ? "default" : "outline"}
        size={showText ? "sm" : "icon"}
        className={`${buttonSize} ${className} transition-all duration-200 hover:scale-105`}
        onClick={handleWishlistToggle}
        disabled={isLoading}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Bookmark
          size={iconSize}
          className={`transition-all duration-200 ${
            isInWishlist
              ? "fill-yellow-500 text-yellow-500"
              : "text-gray-500 hover:text-yellow-500"
          }`}
        />
        {showText && (
          <span className="ml-2 text-sm">
            {isInWishlist ? "Saved" : "Save"}
          </span>
        )}
      </Button>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}