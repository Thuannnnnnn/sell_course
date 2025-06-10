import React, { useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { CourseCard } from "../ui/CourseCard";
import { BookmarkIcon, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
// Mock data for wishlist
const WISHLIST_COURSES = [
  {
    id: "1",
    title: "Advanced JavaScript Patterns",
    instructor: "Sarah Johnson",
    price: "$79.99",
    rating: 4.8,
    category: "JavaScript",
    image:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    title: "React Performance Optimization",
    instructor: "Michael Chen",
    price: "$89.99",
    rating: 4.9,
    category: "React",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
];
export function WishlistSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, price, rating
  const filteredCourses = WISHLIST_COURSES.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5" />
            <h2 className="text-2xl font-bold">My Wishlist</h2>
          </div>
          {/* Search and Filter Bar */}
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
                className="flex-1 sm:flex-none"
              >
                Latest
              </Button>
              <Button
                variant={sortBy === "price" ? "default" : "outline"}
                onClick={() => setSortBy("price")}
                className="flex-1 sm:flex-none"
              >
                Price
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                onClick={() => setSortBy("rating")}
                className="flex-1 sm:flex-none"
              >
                Rating
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="p-6">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start adding courses to your wishlist"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
