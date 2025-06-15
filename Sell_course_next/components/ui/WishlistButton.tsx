"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [hasShownError, setHasShownError] = useState(false);
  
  // Use refs to prevent multiple simultaneous calls
  const isCheckingRef = useRef(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userId = session?.user?.id;
  const token = session?.accessToken;

  // Handle session expiration
  useEffect(() => {
    // Clear existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }

    if (session?.expires) {
      const expireTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      
      if (currentTime >= expireTime) {
        signOut();
      } else {
        sessionTimeoutRef.current = setTimeout(() => {
          signOut();
        }, expireTime - currentTime);
      }
    }

    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    };
  }, [session?.expires]);

  // Check wishlist status when component mounts or dependencies change
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!userId || !token || !courseId || isCheckingRef.current) {
        return;
      }

      try {
        isCheckingRef.current = true;
        const wishlist = await wishlistApi.getWishlist(userId, token);
        const isInList = wishlist.some((item) => item.courseId === courseId);
        setIsInWishlist(isInList);
        
        // Reset error state on successful check
        setHasShownError(false);
      } catch (error) {
        console.error("Error checking wishlist:", error);
        
        // Only show error toast once per session for background checks
        if (!hasShownError) {
          toast({
            title: "Error",
            description: "Unable to check wishlist status.",
            variant: "destructive",
          });
          setHasShownError(true);
        }
        
        // Set to false on error to prevent showing incorrect state
        setIsInWishlist(false);
      } finally {
        isCheckingRef.current = false;
      }
    };

    if (userId && token && courseId) {
      checkWishlistStatus();
    } else {
      setIsInWishlist(false);
    }
  }, [userId, token, courseId, toast, hasShownError]); // Only depend on the actual values

  const handleWishlistToggle = async () => {
    if (!userId || !token) {
      toast({
        title: "Unauthorized",
        description: "Please log in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) {
      return; // Prevent multiple clicks
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
      
      // Always show error for user actions (button clicks)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      
      // Reset error state since this is a user action
      setHasShownError(false);
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
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size={showText ? "sm" : "icon"}
      className={`${buttonSize} ${className} transition-all duration-200 hover:scale-105`}
      onClick={handleWishlistToggle}
      disabled={isLoading || !userId || !token}
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
          {isLoading ? "..." : isInWishlist ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}