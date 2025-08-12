"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { CourseResponseDTO } from "../../app/types/Course/Course";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface CourseCardProps {
  course: CourseResponseDTO;
}

export default function CourseCard({ course }: CourseCardProps) {
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
    return `${Math.floor(duration / 60)}h${
      duration % 60 > 0 ? ` ${duration % 60}m` : ""
    }`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-100 text-blue-800">
            {course.skill}
          </Badge>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-5">
        {/* Category */}
        <div className="text-sm text-blue-600 font-medium mb-2">
          {course.categoryName}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          <Link
            href={`/courses/${course.courseId}`}
            className="hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.short_description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(course.duration)}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.categoryName}
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={course.instructorAvatar || "/placeholder-avatar.jpg"}
              alt={course.instructorName}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="text-sm text-gray-700">{course.instructorName}</span>
        </div>

        {/* Price only (rating removed) */}
        <div className="flex items-center justify-end">
          <div className="text-right">
            {course.price === 0 ? (
              <span className="text-green-600 font-bold">Miễn phí</span>
            ) : (
              <span className="text-blue-600 font-bold">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Button asChild className="w-full">
            <Link href={`/courses/${course.courseId}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
