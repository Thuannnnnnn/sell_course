"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  const [error, setError] = useState<string | null>(null);

  // Auto sign-out on session expiry
  useEffect(() => {
    if (session?.expires) {
      const expireTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      if (currentTime >= expireTime) {
        signOut();
      } else {
        const timeout = setTimeout(() => signOut(), expireTime - currentTime);
        return () => clearTimeout(timeout);
      }
    }
  }, [session]);

  // Fetch wishlist function - removed automatic toast to prevent spam
  const fetchWishlist = useCallback(async (showSuccessToast = false) => {
    if (!session?.user || !session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const wishlistData = await wishlistApi.getWishlist(session.user.id, session.accessToken);
      const transformedCourses = wishlistData
        .filter(item => item.save && item.course.status)
        .map(transformWishlistData);

      setWishlistCourses(transformedCourses);

      // Only show success toast when explicitly requested (like manual refresh)
      if (showSuccessToast) {
        toast({
          title: "Wishlist updated",
          description: "Your wishlist has been refreshed successfully.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      
      // Check if error is due to unauthorized/expired session
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
        console.log("⚠️ Session expired or unauthorized - stopping wishlist fetch");
        setError("Session expired. Please login again.");
        return; // Don't show error toast for auth issues
      }
      
      const errorMessage = err instanceof Error ? err.message : "Could not fetch wishlist. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user, session?.accessToken, toast]); // Use session.user instead of session.user.id

  // Initial fetch on mount - no success toast
  useEffect(() => {
    // Only fetch if we have valid session
    if (session?.user?.id && session?.accessToken) {
      fetchWishlist(false);
    } else if (session === null) {
      // Session is explicitly null (not loading), clear data
      setWishlistCourses([]);
      setLoading(false);
    }
  }, [session, fetchWishlist]); // Use session directly to handle all session changes

  // Filter courses based on search query
  const filteredCourses = wishlistCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort courses based on selected criteria
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1));
      case "rating":
        return b.rating - a.rating;
      default:
        return 0; // For "date" sorting, keep original order since we don't have date info
    }
  });

  // Manual refresh handler - shows success toast
  const handleRefresh = () => {
    fetchWishlist(true);
  };

  // Loading state
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

  // Not signed in state
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

  // Error state
  if (error && !loading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5" />
          <h2 className="text-2xl font-bold">My Wishlist</h2>
        </CardHeader>
        <div className="p-6 text-center py-12">
          <div className="text-destructive mb-4">
            <BookmarkIcon className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load wishlist</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Main component render
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
            <Button 
              variant={sortBy === "date" ? "default" : "outline"} 
              onClick={() => setSortBy("date")}
              size="sm"
            >
              Latest
            </Button>
            <Button 
              variant={sortBy === "price" ? "default" : "outline"} 
              onClick={() => setSortBy("price")}
              size="sm"
            >
              Price
            </Button>
            <Button 
              variant={sortBy === "rating" ? "default" : "outline"} 
              onClick={() => setSortBy("rating")}
              size="sm"
            >
              Rating
            </Button>
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
              <CourseCard 
                key={course.id} 
                course={course} 
                showWishlistButton 
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}