"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Search,
  MapPin,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CalendarPlus,
  TrendingUp,
  Award,
  Hourglass,
  Plus,
} from "lucide-react";
import {
  ScheduleItem,
  calculateEndTime,
  formatDate,
  getDayName,
} from "./../app/types/learningPath/learningPath";
import { ContentResponse } from "@/app/types/Course/Lesson/Lessons";
import { getContentStatus } from "@/app/api/Progress/progress";
import { fetchContentsByIds } from "@/app/api/courses/lessons/content";
import { useSession } from "next-auth/react";

interface EnhancedUserScheduleDisplayProps {
  scheduleItems: ScheduleItem[];
  userId?: string;
  className?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  maxItemsToShow?: number;
  onScheduleItemClick?: (item: ScheduleItem) => void;
  onAddToCalendar?: (item: ScheduleItem) => void;
  onAddWeekToCalendar?: (weekNumber: number, items: ScheduleItem[]) => void;
  isLoading?: boolean;
  accessToken?: string;
}

interface ScheduleFilter {
  weekNumber?: number;
  dayOfWeek?: number;
  courseId?: string;
  searchTerm?: string;
}

interface WeekInfo {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  items: ScheduleItem[];
  completionRate: number;
}
export interface ContentProgressStatus {
  contentId: string;
  userId: string;
  isCompleted: boolean;
  completedAt?: string;
  progress?: number; // 0-100 percentage
  lastAccessedAt?: string;
  timeSpent?: number; // in minutes
}

export interface ContentWithProgress extends ContentResponse {
  progress?: ContentProgressStatus;
  isCompleted?: boolean;
  completionPercentage?: number;
}

const DAY_NAMES = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const WEEK_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
];

export default function EnhancedUserScheduleDisplay({
  scheduleItems = [],
  userId,
  className = "",
  showHeader = true,
  showFilters = false,
  maxItemsToShow,
  onScheduleItemClick,
  onAddToCalendar,
  onAddWeekToCalendar,
  isLoading = false,
}: EnhancedUserScheduleDisplayProps) {
    const { data: session } = useSession();
  const [filter, setFilter] = useState<ScheduleFilter>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [contentProgress, setContentProgress] = useState<
    Map<string, ContentWithProgress>
  >(new Map());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [showModal, setShowModal] = useState(false);
const token = session?.accessToken;
  // Load content progress data
  useEffect(() => {
    const loadContentProgress = async () => {
      try {
        if(!token) return;
        const allContentIds = scheduleItems.flatMap((item) => item.contentIds);
        const uniqueContentIds = Array.from(new Set(allContentIds));

        if (uniqueContentIds.length === 0 || !userId) return;

        // Fetch content details in batch
        const contents = await fetchContentsByIds(uniqueContentIds, token);

        const progressResults = await Promise.all(
          uniqueContentIds.map((id) => getContentStatus(id, userId, token))
        );

        const progressMap = new Map<string, ContentWithProgress>();

        contents.forEach((content) => {
          const progress = progressResults.find(
            (p) => p.contentId === content.contentId
          );

          progressMap.set(content.contentId, {
            ...content,
            progress,
            isCompleted: progress?.isCompleted ?? false,
          });
        });

        setContentProgress(progressMap);
      } catch (error) {
        console.error("Failed to load content progress:", error);
      }
    };

    if (userId && scheduleItems.length > 0) {
      loadContentProgress();
    }
  }, [userId, scheduleItems]);

  // Calculate week information
  const getWeekInfo = (weekNumber: number, items: ScheduleItem[]): WeekInfo => {
    const weekItems = items.filter((item) => item.weekNumber === weekNumber);

    // Calculate start and end dates for the week
    const dates = weekItems.map((item) => new Date(item.scheduledDate));
    const startDate =
      dates.length > 0
        ? new Date(Math.min(...dates.map((d) => d.getTime())))
        : new Date();
    const endDate =
      dates.length > 0
        ? new Date(Math.max(...dates.map((d) => d.getTime())))
        : new Date();

    // Calculate completion rate
    const totalContents = weekItems.reduce(
      (sum, item) => sum + item.contentIds.length,
      0
    );
    const completedContents = weekItems.reduce((sum, item) => {
      return (
        sum +
        item.contentIds.filter((contentId) => {
          const content = contentProgress.get(contentId);
          return content?.isCompleted || false;
        }).length
      );
    }, 0);

    const completionRate =
      totalContents > 0 ? (completedContents / totalContents) * 100 : 0;

    return {
      weekNumber,
      startDate,
      endDate,
      items: weekItems,
      completionRate: Math.round(completionRate),
    };
  };

  const availableWeeks = Array.from(
    new Set(scheduleItems.map((item) => item.weekNumber))
  ).sort();

  const availableCourses = Array.from(
    new Set(scheduleItems.map((item) => item.courseId))
  );

  // Filter schedule items based on current filters
  const filteredItems = scheduleItems.filter((item) => {
    if (filter.weekNumber && item.weekNumber !== filter.weekNumber)
      return false;
    if (filter.dayOfWeek !== undefined && item.dayOfWeek !== filter.dayOfWeek)
      return false;
    if (filter.courseId && item.courseId !== filter.courseId) return false;

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const contentNames = item.contentIds
        .map((contentId) => {
          const content = contentProgress.get(contentId);
          return content?.contentName || contentId;
        })
        .join(" ");

      const itemText = `${getDayName(item.dayOfWeek)} ${
        item.startTime
      } ${contentNames}`.toLowerCase();
      if (!itemText.includes(searchLower)) return false;
    }

    return true;
  });

  // Apply max items limit if specified
  const displayItems = maxItemsToShow
    ? filteredItems.slice(0, maxItemsToShow)
    : filteredItems;

  // Group items by week for better organization
  const itemsByWeek = displayItems.reduce((acc, item) => {
    if (!acc[item.weekNumber]) {
      acc[item.weekNumber] = [];
    }
    acc[item.weekNumber].push(item);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  // Sort items within each week by day and time
  Object.keys(itemsByWeek).forEach((week) => {
    itemsByWeek[parseInt(week)].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getWeekColor = (weekNumber: number) => {
    return WEEK_COLORS[(weekNumber - 1) % WEEK_COLORS.length];
  };

  const getScheduleStatus = (item: ScheduleItem) => {
    const scheduleDate = new Date(item.scheduledDate);
    const [hours, minutes] = item.startTime.split(":").map(Number);
    const scheduleDateTime = new Date(scheduleDate);
    scheduleDateTime.setHours(hours, minutes);

    const endDateTime = new Date(scheduleDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + item.durationMin);

    if (contentProgress.values().some((c) => c.isCompleted == false)) {
      return { status: "Uncompleted", icon: Hourglass, color: "text-blue-500" };
    } else {
      return {
        status: "completed",
        icon: CheckCircle2,
        color: "text-gray-500",
      };
    }
  };

  const getContentCompletionRate = (item: ScheduleItem): number => {
    const completedContents = item.contentIds.filter((contentId) => {
      const content = contentProgress.get(contentId);
      return content?.isCompleted || false;
    }).length;

    return item.contentIds.length > 0
      ? Math.round((completedContents / item.contentIds.length) * 100)
      : 0;
  };

  const formatWeekDateRange = (weekInfo: WeekInfo): string => {
    const startStr = weekInfo.startDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    const endStr = weekInfo.endDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${startStr} - ${endStr}`;
  };

  const handleAddToCalendar = (item: ScheduleItem, event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCalendar?.(item);
  };

  const handleAddWeekToCalendar = (
    weekNumber: number,
    items: ScheduleItem[]
  ) => {
    onAddWeekToCalendar?.(weekNumber, items);
  };

  const openModal = (item: ScheduleItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  const renderScheduleItem = (item: ScheduleItem, index: number) => {
    const itemId = `${item.weekNumber}-${item.dayOfWeek}-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const isHovered = hoveredItem === itemId;
    const endTime = calculateEndTime(item.startTime, item.durationMin);
    const formattedDate = formatDate(item.scheduledDate);
    const dayName = getDayName(item.dayOfWeek);
    const weekColor = getWeekColor(item.weekNumber);
    const scheduleStatus = getScheduleStatus(item);
    const StatusIcon = scheduleStatus.icon;
    const completionRate = getContentCompletionRate(item);

    // Format full date with year
    const fullDate = new Date(item.scheduledDate).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        key={itemId}
        className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group ${
          onScheduleItemClick ? "cursor-pointer" : ""
        }`}
        onClick={() => onScheduleItemClick?.(item)}
        onMouseEnter={() => setHoveredItem(itemId)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {/* Hover Add to Calendar Button */}
        {isHovered && onAddToCalendar && (
          <button
            onClick={(e) => handleAddToCalendar(item, e)}
            className="absolute top-3 right-3 z-10 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Thêm vào Google Calendar"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border ${weekColor}`}
              >
                Week {item.weekNumber}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <StatusIcon className={`w-4 h-4 ${scheduleStatus.color}`} />
                <span className="text-sm capitalize">
                  {scheduleStatus.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{dayName}</div>
              <div className="text-xs text-gray-500">{formattedDate}</div>
            </div>
          </div>

          {/* Full Date Display */}
          <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
            📅 {fullDate}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Time and Duration */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {item.startTime} - {endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Target className="w-4 h-4" />
              <span className="text-sm">{item.durationMin} minutes</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Completion progress
              </span>
              <span className="text-sm text-gray-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  completionRate === 100
                    ? "bg-green-500"
                    : completionRate > 0
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Content Items */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
               Learning content ({item.contentIds.length})
              </h4>
              {item.contentIds.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(itemId);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {isExpanded ? "simplify" : "Read more"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(isExpanded ? item.contentIds : item.contentIds.slice(0, 3)).map(
                (contentId, contentIndex) => {
                  const content = contentProgress.get(contentId);
                  const isCompleted = content?.isCompleted || false;

                  return (
                    <div
                      key={contentIndex}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        isCompleted
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      title={content?.contentName || contentId}
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      {content?.contentName || `Nội dung ${contentIndex + 1}`}
                    </div>
                  );
                }
              )}
              {!isExpanded && item.contentIds.length > 3 && (
                <div className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-sm">
                  +{item.contentIds.length - 3} nữa
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal(item);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <MoreHorizontal className="w-4 h-4" />
                Details
            </button>

            {onAddToCalendar && (
              <button
                onClick={(e) => handleAddToCalendar(item, e)}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md font-medium flex items-center gap-1 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to calendar
              </button>
            )}
          </div>

          {/* Course ID (if different courses) */}
          {availableCourses.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <MapPin className="w-3 h-3" />
              <span>Course: {item.courseId.slice(0, 8)}...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekHeader = (weekNumber: number, items: ScheduleItem[]) => {
    const weekInfo = getWeekInfo(weekNumber, items);
    const weekColor = getWeekColor(weekNumber);

    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-semibold ${weekColor}`}>
            Tuần {weekNumber}
          </div>
          <div className="text-sm text-gray-600">
            📅 {formatWeekDateRange(weekInfo)}
          </div>
          <div className="text-sm text-gray-600">
            📚 {items.length} buổi học
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">
              {weekInfo.completionRate}%
            </span>
          </div>
        </div>

        {onAddWeekToCalendar && (
          <button
            onClick={() => handleAddWeekToCalendar(weekNumber, items)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Add this week to Google Calendar
          </button>
        )}
      </div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={filter.searchTerm || ""}
              onChange={(e) =>
                setFilter({ ...filter, searchTerm: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Week Filter */}
          <select
            value={filter.weekNumber || ""}
            onChange={(e) =>
              setFilter({
                ...filter,
                weekNumber: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All week</option>
            {availableWeeks.map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>

          {/* Day Filter */}
          <select
            value={filter.dayOfWeek !== undefined ? filter.dayOfWeek : ""}
            onChange={(e) =>
              setFilter({
                ...filter,
                dayOfWeek: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All days</option>
            {DAY_NAMES.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>

          {/* Completion Status Filter */}

          {/* Course Filter (if multiple courses) */}
          {availableCourses.length > 1 && (
            <select
              value={filter.courseId || ""}
              onChange={(e) =>
                setFilter({ ...filter, courseId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All courses</option>
              {availableCourses.map((courseId) => (
                <option key={courseId} value={courseId}>
                  {courseId.slice(0, 8)}...
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Clear Filters */}
        {(filter.searchTerm ||
          filter.weekNumber ||
          filter.dayOfWeek !== undefined ||
          filter.courseId) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setFilter({})}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
             Clear filter
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderWeekNavigation = () => {
    if (availableWeeks.length <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
          disabled={currentWeek <= 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {availableWeeks.map((week) => (
            <button
              key={week}
              onClick={() => setCurrentWeek(week)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentWeek === week
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Week {week}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentWeek(Math.min(availableWeeks.length, currentWeek + 1))
          }
          disabled={currentWeek >= availableWeeks.length}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Modal Component
  const renderModal = () => {
    if (!showModal || !selectedItem) return null;

    const completionRate = getContentCompletionRate(selectedItem);
    const scheduleStatus = getScheduleStatus(selectedItem);
    const StatusIcon = scheduleStatus.icon;
    const endTime = calculateEndTime(
      selectedItem.startTime,
      selectedItem.durationMin
    );
    const fullDate = new Date(selectedItem.scheduledDate).toLocaleDateString(
      "vi-VN",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Lesson details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Date and Time */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📅 Time
                </h3>
                <p className="text-gray-700">{fullDate}</p>
                <p className="text-gray-700">
                  {selectedItem.startTime} - {endTime} (
                  {selectedItem.durationMin} minute)
                </p>
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📊 Status
                </h3>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${scheduleStatus.color}`} />
                  <span className="capitalize">{scheduleStatus.status}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🎯 Completion progress
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full ${
                      completionRate === 100
                        ? "bg-green-500"
                        : completionRate > 0
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {completionRate}% complete
                </p>
              </div>

              {/* Content List */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📚 Learning content
                </h3>
                <div className="space-y-2">
                  {selectedItem.contentIds.map((contentId, index) => {
                    const content = contentProgress.get(contentId);
                    const isCompleted = content?.isCompleted || false;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-2 rounded ${
                          isCompleted
                            ? "bg-green-50 border border-green-200"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                        <span
                          className={
                            isCompleted ? "text-green-800" : "text-gray-700"
                          }
                        >
                          {content?.contentName || `Nội dung ${index + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {onAddToCalendar && (
                  <button
                    onClick={() => {
                      onAddToCalendar(selectedItem);
                      closeModal();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Add to Google Calendar
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Your class schedule
            </h2>
          </div>
        )}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-xl h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (scheduleItems.length === 0) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Your class schedule
            </h2>
          </div>
        )}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No schedule yet
          </h3>
          <p className="text-gray-600">
            You don't have any classes planned yet. Create a learning path to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Your class schedule
            </h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {filteredItems.length} lesson
            </div>
            {userId && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Award className="w-4 h-4" />
                <span>
                  {Math.round(
                    filteredItems.reduce(
                      (sum, item) => sum + getContentCompletionRate(item),
                      0
                    ) / (filteredItems.length || 1)
                  )}
                  % complete
                </span>
              </div>
            )}
          </div>
          {userId && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm">{userId.slice(0, 8)}...</span>
            </div>
          )}
        </div>
      )}

      {/* Week Navigation */}
      {renderWeekNavigation()}

      {/* Filters */}
      {renderFilters()}

      {/* Schedule Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No class schedule found
          </h3>
          <p className="text-gray-600">
            There are no class schedules matching the current filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(itemsByWeek)
            .map(Number)
            .sort((a, b) => a - b)
            .map((weekNumber) => (
              <div key={weekNumber}>
                {renderWeekHeader(weekNumber, itemsByWeek[weekNumber])}
                <div className="grid gap-4">
                  {itemsByWeek[weekNumber].map((item, index) =>
                    renderScheduleItem(item, index)
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Show more indicator */}
      {maxItemsToShow && filteredItems.length > maxItemsToShow && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
           Display {maxItemsToShow} in total {filteredItems.length} lesson
          </p>
        </div>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
