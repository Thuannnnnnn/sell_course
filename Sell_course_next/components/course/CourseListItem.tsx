"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, BookOpen } from "lucide-react";
import { CourseResponseDTO } from "../../app/types/Course/Course";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface CourseListItemProps {
  course: CourseResponseDTO;
}

export default function CourseListItem({ course }: CourseListItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} min`;
    }
    return `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ""}`;
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
      case "basic":
        return "bg-green-100 text-green-800";
      case "intermediate":
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Course Image */}
        <div className="relative w-full md:w-80 h-48 md:h-auto md:min-h-[200px] overflow-hidden">
          <Image
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge className={getLevelColor(course.level)}>
              {course.level}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-100 text-blue-800">
              {course.skill}
            </Badge>
          </div>
        </div>

        {/* Course Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-1">
              {/* Category */}
              <div className="text-sm text-blue-600 font-medium mb-2">
                {course.categoryName}
              </div>

              {/* Title */}
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                <Link 
                  href={`/courses/${course.courseId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {course.title}
                </Link>
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.categoryName}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  {course.rating.toFixed(1)}
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={course.instructorAvatar || "/placeholder-avatar.jpg"}
                    alt={course.instructorName}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="text-gray-700 font-medium">{course.instructorName}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
              {/* Price */}
              <div className="flex items-center gap-2">
                {course.price === 0 ? (
                  <span className="text-green-600 font-bold text-xl">Miễn phí</span>
                ) : (
                  <span className="text-blue-600 font-bold text-xl">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <Button asChild>
                <Link href={`/courses/${course.courseId}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
