"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningPlanData } from "@/app/types/learningPath/learningPath";

interface LearningPathListProps {
  learningPlans: LearningPlanData[];
  onCreateNew: () => void;
  onViewPlan: (plan: LearningPlanData) => void;
  onDeletePlan: (planId: string) => void;
  updatePlan: () => void;
}

export default function LearningPathList({
  learningPlans,
  onCreateNew,
  onViewPlan,
  onDeletePlan,
  updatePlan,
}: LearningPathListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const calculateTotalDuration = (plan: LearningPlanData): number => {
    return plan.learningPathCourses.reduce((total, course) => {
      return (
        total +
        course.lessons.reduce((lessonTotal, lesson) => {
          return (
            lessonTotal +
            lesson.contents.reduce((contentTotal, content) => {
              return contentTotal + content.durationMin;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const filteredPlans = learningPlans.filter((plan) => {
    const matchesSearch =
      plan.targetLearningPath.topic
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      plan.targetLearningPath.learning_goal
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterLevel === "all" ||
      plan.targetLearningPath.target_level.toLowerCase() ===
        filterLevel.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this learning path?")) {
      onDeletePlan(planId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                My Learning Paths
              </h1>
            </div>
            {learningPlans ? (
              <Button
                onClick={onCreateNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create New Path
              </Button>
            ) : (
              <Button
                onClick={updatePlan}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                update
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Learning Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {learningPlans.length === 0
                ? "No Learning Paths Yet"
                : "No Matching Learning Paths"}
            </h3>
            <p className="text-gray-600 mb-6">
              {learningPlans.length === 0
                ? "Create your first personalized learning path to get started."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan.planId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => onViewPlan(plan)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {plan.targetLearningPath.topic}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {plan.targetLearningPath.learning_goal}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Level:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(
                          plan.targetLearningPath.target_level
                        )}`}
                      >
                        {plan.targetLearningPath.target_level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {plan.targetLearningPath.desired_duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Content:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDuration(calculateTotalDuration(plan))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Courses:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {plan.learningPathCourses.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{plan.targetLearningPath.userName}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPlan(plan);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, plan.planId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
