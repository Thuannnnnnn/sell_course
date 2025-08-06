"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  BookOpen,
  CheckCircle,
  Clock,
  User,
  Plus,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LearningPlanData,
  CourseItem,
  LearningPlanWithProgress,
} from "@/app/types/learningPath/learningPath";
import { createLearningPathAPI } from "@/app/api/learningPath/learningPathAPI";
import {
  extractAllContentIds,
  calculateCourseProgress,
  getCourseStatus,
  formatDuration,
  calculateTotalDuration,
  getStatusColor,
} from "@/utils/learningPathUtils";

// Định nghĩa kiểu dữ liệu cho một lộ trình đã được nhóm
interface GroupedLearningPath {
  topic: string;
  learning_goal: string;
  userName: string;
  current_level: string;
  target_level: string;
  desired_duration: string;
  plans: LearningPlanWithProgress[];
  totalCourses: number;
  totalDuration: number;
  overallProgress: {
    completedContents: number;
    totalContents: number;
    percentage: number;
  };
}

interface LearningPathRoadmapProps {
  learningPlans: LearningPlanData[];
  onCreateNew: () => void;
  onViewCourse: (plan: LearningPlanData, course: CourseItem) => void;
  updatePlan: () => void;
  userId: string;
  token: string;
}

export default function LearningPathRoadmap({
  learningPlans,
  onCreateNew,
  onViewCourse,
  userId,
  token,
  updatePlan,
}: LearningPathRoadmapProps) {
  const [groupedRoadmapData, setGroupedRoadmapData] = useState<
    GroupedLearningPath[]
  >([]);

  const api = createLearningPathAPI(token);
  const [loading, setLoading] = useState(true);
  const [canCreateNewPath, setCanCreateNewPath] = useState(false);

  useEffect(() => {
    const fetchAndGroupData = async () => {
      if (!learningPlans || learningPlans.length === 0) {
        setLoading(false);
        setCanCreateNewPath(true); // Allow creation if no paths exist
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch progress for all individual plans
        const progressDataPromises = learningPlans.map(
          async (plan: LearningPlanData): Promise<LearningPlanWithProgress> => {
            const allContentIds = extractAllContentIds(plan);
            const [contentProgress, pathProgress] = await Promise.all([
              api.getBulkContentProgress(userId, allContentIds),
              api.getLearningPathProgress(userId, allContentIds),
            ]);

            return {
              plan,
              progress: pathProgress,
              contentProgress,
              canCreateNew: pathProgress.overallProgressPercentage >= 100,
            };
          }
        );

        const allPlansWithProgress = await Promise.all(progressDataPromises);

        // 2. Group plans by topic
        const groupedByTopic = allPlansWithProgress.reduce((acc, current) => {
          const topic = current.plan.targetLearningPath.topic;
          if (!acc[topic]) {
            acc[topic] = [];
          }
          acc[topic].push(current);
          return acc;
        }, {} as Record<string, LearningPlanWithProgress[]>);

        // 3. Create the final grouped roadmap data structure
        const finalGroupedData: GroupedLearningPath[] = Object.values(
          groupedByTopic
        ).map((plans) => {
          const firstPlan = plans[0].plan;
          let totalCourses = 0;
          let totalDuration = 0;
          let totalCompletedContents = 0;
          let totalContents = 0;

          plans.forEach((p) => {
            totalCourses += p.plan.learningPathCourses.length;
            totalDuration += calculateTotalDuration(p.plan);
            if (p.progress) {
              totalCompletedContents += p.progress.completedContents;
              totalContents += p.progress.totalContents;
            }
          });

          const overallPercentage =
            totalContents > 0
              ? Math.round((totalCompletedContents / totalContents) * 100)
              : 0;

          return {
            topic: firstPlan.targetLearningPath.topic,
            learning_goal: firstPlan.targetLearningPath.learning_goal,
            userName: firstPlan.targetLearningPath.userName,
            current_level: firstPlan.targetLearningPath.current_level,
            target_level: firstPlan.targetLearningPath.target_level,
            desired_duration: firstPlan.targetLearningPath.desired_duration,
            plans: plans,
            totalCourses,
            totalDuration,
            overallProgress: {
              completedContents: totalCompletedContents,
              totalContents: totalContents,
              percentage: overallPercentage,
            },
          };
        });

        const results = await Promise.all(finalGroupedData);
        setGroupedRoadmapData(finalGroupedData);
        console.log("Grouped roadmap data:", finalGroupedData);
        const hasCompletedPath = results.some(
          (result) => result.overallProgress.percentage === 100
        );
        setCanCreateNewPath(hasCompletedPath || learningPlans.length === 0);
      } catch (error) {
        setCanCreateNewPath(false);
        console.error("Failed to fetch or group progress data:", error);
        toast.error("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchAndGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningPlans, userId, token]);
  const handleCreateNewClick = () => {
    if (!canCreateNewPath) {
      toast.error(
        "You must complete at least one learning path 100% before creating a new one."
      );
      return;
    }
    onCreateNew();
  };

  // ... (phần loading và empty state giữ nguyên)

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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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

      {/* Roadmap Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-16">
          {groupedRoadmapData.map((groupedPath, index) => (
            <div key={groupedPath.topic + index} className="relative">
              {/* Root Node: Grouped Learning Path Details */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center self-stretch">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  {/* danh dau */}
                  <div className="w-1 flex-grow bg-gradient-to-b from-purple-500 to-blue-500 mt-2"></div>
                </div>

                <div className="flex-1 space-y-8">
                  {/* Grouped Info Box */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {groupedPath.topic}
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {groupedPath.learning_goal}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{groupedPath.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDuration(groupedPath.totalDuration)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{groupedPath.totalCourses} courses</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-sm text-gray-500 mb-1">
                          Overall Progress
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {groupedPath.overallProgress.percentage}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${groupedPath.overallProgress.percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>
                          {groupedPath.overallProgress.completedContents}{" "}
                          completed
                        </span>
                        <span>
                          {groupedPath.overallProgress.totalContents} total
                          contents
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                        {groupedPath.current_level} → {groupedPath.target_level}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                        {groupedPath.desired_duration}
                      </span>
                    </div>
                  </div>

                  {/* Course Nodes List */}
                  <div className="space-y-6">
                    {groupedPath.plans
                      .flatMap((data) =>
                        data.plan.learningPathCourses.map((course) => ({
                          course,
                          data,
                        }))
                      )
                      .sort(
                        (a, b) => (a.course.order || 0) - (b.course.order || 0)
                      )
                      .map(({ course, data }) => {
                        const courseProgress = calculateCourseProgress(
                          course,
                          data.contentProgress
                        );
                        const courseStatus = getCourseStatus(
                          course,
                          data.contentProgress
                        );
                        return (
                          <div
                            key={course.courseId}
                            className="flex items-start gap-6 relative"
                          >
                            <div className="absolute left-[-3.25rem] top-6 w-6 h-px bg-gray-300"></div>
                            <div className="flex flex-col items-center self-stretch">
                              <div
                                className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-md flex-shrink-0`}
                              >
                                <div className="font-bold text-xl">
                                  {course.order}
                                </div>
                              </div>
                              <div className="w-1 flex-grow bg-gradient-to-b from-purple-500 to-blue-500 mt-2"></div>
                              {/* danh dau */}
                            </div>

                            <div className="flex-1">
                              <Button
                                variant="outline"
                                className={`w-full justify-start p-6 h-auto text-left ${getStatusColor(
                                  courseStatus
                                )} hover:shadow-lg transition-all duration-200`}
                                onClick={() => onViewCourse(data.plan, course)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                      {course.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                      <span>
                                        {course.lessons.length} lessons
                                      </span>
                                      <span>
                                        {formatDuration(
                                          course.lessons.reduce(
                                            (total, lesson) =>
                                              total +
                                              lesson.contents.reduce(
                                                (lessonTotal, content) =>
                                                  lessonTotal +
                                                  content.durationMin,
                                                0
                                              ),
                                            0
                                          )
                                        )}
                                      </span>
                                      <span className="font-medium text-blue-600">
                                        {courseProgress}% completed
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                                </div>
                              </Button>
                              <div className="mt-3 px-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${courseProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Completion Status */}
                  {groupedPath.overallProgress.percentage >= 100 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          Learning Path Completed!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Congratulations! You can now create a new learning path.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
