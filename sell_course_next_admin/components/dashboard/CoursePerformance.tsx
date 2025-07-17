"use client";
import React from "react";
import { BookOpen, Users, Star, DollarSign } from "lucide-react";
import { useCoursePerformance } from "../../hooks/useDashboard";

export function CoursePerformance() {
  const { data: courseData, loading, error } = useCoursePerformance();

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Top Performing Courses</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">
            {error || "Failed to load course performance data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Performing Courses</h2>
        <div className="text-sm text-gray-500">
          {courseData.topCourses.length} courses
        </div>
      </div>

      <div className="space-y-4">
        {courseData.topCourses.slice(0, 5).map((course, index) => (
          <div
            key={course.courseId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    #{index + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{course.title}</h3>
                <p className="text-xs text-gray-500">{course.category}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <Users className="w-3 h-3 mr-1" />
                    {course.enrollments}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Star className="w-3 h-3 mr-1" />
                    {course.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course.completionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 font-semibold text-sm">
                <DollarSign className="w-3 h-3 mr-1" />
                {course.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {courseData.totalCourses}
            </div>
            <div className="text-xs text-gray-500">Total Courses</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {courseData.activeCourses}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {courseData.averageCompletionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Avg Completion</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">
              {courseData.averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}