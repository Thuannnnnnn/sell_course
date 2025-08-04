"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  User,
  Plus,
  Eye,
  Trash2,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LearningPlanData,
  LearningPlanWithProgress,
} from "@/app/types/learningPath/learningPath";
import { createLearningPathAPI } from "@/app/api/learningPath/learningPathAPI";
import {
  extractAllContentIds,
  calculateTotalDuration,
  formatDuration,
  getProgressTextColor,
} from "@/utils/learningPathUtils";

interface LearningPathListProps {
  learningPlans: LearningPlanData[];
  onCreateNew: () => void;
  onViewPlan: (plan: LearningPlanData) => void;
  onDeletePlan: (planId: string) => void;
  updatePlan: () => void;
  userId: string;
  token: string;
}

export default function LearningPathList({
  learningPlans,
  onCreateNew,
  onViewPlan,
  onDeletePlan,
  updatePlan,
  userId,
  token,
}: LearningPathListProps) {
  const [plansWithProgress, setPlansWithProgress] = useState<
    LearningPlanWithProgress[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [canCreateNewPath, setCanCreateNewPath] = useState(false);

  const api = createLearningPathAPI(token);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!learningPlans || learningPlans.length === 0) {
        setLoading(false);
        setCanCreateNewPath(true); // Allow creation if no paths exist
        return;
      }

      try {
        setLoading(true);
        const progressPromises = learningPlans.map(
          async (plan: LearningPlanData) => {
            const allContentIds = extractAllContentIds(plan);

            try {
              const pathProgress = await api.getLearningPathProgress(
                userId,
                allContentIds
              );
              const canCreate = pathProgress.overallProgressPercentage >= 100;

              return {
                plan,
                progress: pathProgress,
                contentProgress: {},
                canCreateNew: canCreate,
              };
            } catch (error) {
              console.error(
                `Failed to fetch progress for plan ${plan.planId}:`,
                error
              );
              return {
                plan,
                progress: null,
                contentProgress: {},
                canCreateNew: false,
              };
            }
          }
        );

        const results = await Promise.all(progressPromises);
        setPlansWithProgress(results);

        const hasCompletedPath = results.some((result) => result.canCreateNew);
        setCanCreateNewPath(hasCompletedPath || learningPlans.length === 0);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
        toast.error("Failed to load progress data");
        setCanCreateNewPath(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningPlans, userId, token]);

  const getLevelColor = (level: string): string => {
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

  const handleCreateNewClick = () => {
    if (!canCreateNewPath) {
      toast.error(
        "You must complete at least one learning path 100% before creating a new one."
      );
      return;
    }
    onCreateNew();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              {!canCreateNewPath && learningPlans.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>Complete a learning path to create new ones</span>
                </div>
              )}

              {canCreateNewPath ? (
                <Button
                  onClick={handleCreateNewClick}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Create New Path
                </Button>
              ) : (
                <Button
                  onClick={handleCreateNewClick}
                  disabled
                  className="flex items-center gap-2 bg-gray-300 cursor-not-allowed"
                  title="Complete at least one learning path 100% to create new ones"
                >
                  <Plus className="w-4 h-4" />
                  Create New Path
                </Button>
              )}

              <Button
                onClick={updatePlan}
                variant="outline"
                className="flex items-center gap-2"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Learning Plans Grid */}
        {plansWithProgress.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Learning Paths Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first personalized learning path to get started.
            </p>
            {canCreateNewPath && (
              <Button
                onClick={handleCreateNewClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Learning Path
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plansWithProgress.map((item) => {
              const { plan, progress, canCreateNew } = item;

              return (
                <div
                  key={plan.planId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => onViewPlan(plan)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {plan.targetLearningPath.topic}
                          </h3>
                          {canCreateNew && (
                            <span title="Completed">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {plan.targetLearningPath.learning_goal}
                        </p>
                      </div>
                    </div>

                    {progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Progress:
                          </span>
                          <span
                            className={`text-sm font-medium ${getProgressTextColor(
                              progress
                            )}`}
                          >
                            {progress.overallProgressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${progress.overallProgressPercentage}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{progress.completedContents} completed</span>
                          <span>{progress.totalContents} total</span>
                        </div>
                      </div>
                    )}

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
                          Created{" "}
                          {new Date(plan.createdAt).toLocaleDateString()}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
