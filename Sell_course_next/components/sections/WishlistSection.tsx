"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardHeader } from "../ui/card";
import { CourseCard } from "../ui/CourseCard";
import { BookmarkIcon, Search, RefreshCw } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSession, signOut } from "next-auth/react";
import { wishlistApi } from "@/app/api/wishlist/wishlist-api";
import { WishlistResponseDto } from "@/app/types/profile/wishlist/wishlist";
import { CourseCardData } from "@/app/types/Course/Course";
import { useToast } from "@/components/ui/use-toast";

// Convert wishlist item to CourseCard format
const transformWishlistData = (wishlistItem: WishlistResponseDto): CourseCardData => ({
  id: wishlistItem.course.courseId,
  title: wishlistItem.course.title,
  instructor: wishlistItem.course.instructorName,
  price: `$${wishlistItem.course.price.toFixed(2)}`,
  rating: wishlistItem.course.rating,
  image: wishlistItem.course.thumbnail || "/placeholder-course.jpg",
  description: wishlistItem.course.short_description,
  level: wishlistItem.course.level,
  duration: wishlistItem.course.duration,
});

export function WishlistSection() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [wishlistCourses, setWishlistCourses] = useState<CourseCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "price" | "rating">("date");
  const [loading, setLoading] = useState(true);
  const [hasShownError, setHasShownError] = useState(false);
  
  // Use ref to track if we're already fetching to prevent multiple calls
  const isFetchingRef = useRef(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle session expiration without causing re-renders
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

  // Initial fetch on mount and when session changes
  useEffect(() => {
    const fetchWishlist = async (showToast = false) => {
      // Prevent multiple simultaneous calls
      if (isFetchingRef.current) {
        return;
      }

      const userId = session?.user?.id;
      const accessToken = session?.accessToken;

      if (!userId || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        isFetchingRef.current = true;
        setLoading(true);

        const wishlistData = await wishlistApi.getWishlist(userId, accessToken);
        
        // Reset error state on successful fetch
        setHasShownError(false);
        
        const transformedCourses = wishlistData
          .filter(item => item.save && item.course.status)
          .map(transformWishlistData);

        setWishlistCourses(transformedCourses);

        if (showToast) {
          toast({
            title: "Wishlist updated",
            description: "Your wishlist has been refreshed successfully.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        
        // Only show error toast once per session or on manual refresh
        if (!hasShownError || showToast) {
          toast({
            title: "Error",
            description: "Could not fetch wishlist. Please try again.",
            variant: "destructive",
          });
          setHasShownError(true);
        }
        
        // Set empty array on error to prevent showing stale data
        setWishlistCourses([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchWishlist();
  }, [session?.user?.id, session?.accessToken, toast, hasShownError]);

  // Separate function for manual refresh
  const fetchWishlist = useCallback(async (showToast = false) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }

    const userId = session?.user?.id;
    const accessToken = session?.accessToken;

    if (!userId || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);

      const wishlistData = await wishlistApi.getWishlist(userId, accessToken);
      
      // Reset error state on successful fetch
      setHasShownError(false);
      
      const transformedCourses = wishlistData
        .filter(item => item.save && item.course.status)
        .map(transformWishlistData);

      setWishlistCourses(transformedCourses);

      if (showToast) {
        toast({
          title: "Wishlist updated",
          description: "Your wishlist has been refreshed successfully.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      
      // Always show error on manual refresh
      toast({
        title: "Error",
        description: "Could not fetch wishlist. Please try again.",
        variant: "destructive",
      });
      
      // Set empty array on error to prevent showing stale data
      setWishlistCourses([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [session?.user?.id, session?.accessToken, toast])

  const filteredCourses = wishlistCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1));
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleRefresh = () => {
    fetchWishlist(true); // Show toast on manual refresh
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5" />
          <h2 className="text-2xl font-bold">My Wishlist</h2>
        </CardHeader>
        <div className="p-6 text-center py-12">
          <div className="animate-spin h-12 w-12 border-2 border-b-transparent rounded-full border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5" />
          <h2 className="text-2xl font-bold">My Wishlist</h2>
        </CardHeader>
        <div className="p-6 text-center py-12">
          <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please login to view your wishlist</h3>
          <p className="text-muted-foreground">
            Sign in to save and manage your favorite courses
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5" />
            <h2 className="text-2xl font-bold">My Wishlist</h2>
            <span className="text-sm text-muted-foreground">
              ({wishlistCourses.length} courses)
            </span>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={sortBy === "date" ? "default" : "outline"} onClick={() => setSortBy("date")}>Latest</Button>
            <Button variant={sortBy === "price" ? "default" : "outline"} onClick={() => setSortBy("price")}>Price</Button>
            <Button variant={sortBy === "rating" ? "default" : "outline"} onClick={() => setSortBy("rating")}>Rating</Button>
          </div>
        </div>
      </CardHeader>
      <div className="p-6">
        {sortedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No courses found" : "Your wishlist is empty"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start adding courses to your wishlist by clicking the heart icon on any course"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} showWishlistButton />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}