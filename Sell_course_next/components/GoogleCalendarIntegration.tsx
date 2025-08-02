"use client";

import React, { useState } from "react";
import {
  Calendar,
  CalendarPlus,
  ExternalLink,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
} from "lucide-react";
import {
  ScheduleItem,
  getDayName,
  formatDate,
} from "./../app/types/learningPath/learningPath";

interface GoogleCalendarIntegrationProps {
  scheduleItem?: ScheduleItem;
  scheduleItems?: ScheduleItem[];
  weekNumber?: number;
  onClose?: () => void;
  className?: string;
}

interface CalendarEvent {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

export default function GoogleCalendarIntegration({
  scheduleItem,
  scheduleItems = [],
  weekNumber,
  onClose,
  className = "",
}: GoogleCalendarIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Format date and time for Google Calendar
  const formatDateTimeForGoogle = (date: string, time: string): string => {
    const scheduleDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    scheduleDate.setHours(hours, minutes, 0, 0);

    // Format as YYYYMMDDTHHMMSSZ (UTC)
    return scheduleDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  // Calculate end time
  const calculateEndTime = (startTime: string, durationMin: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMin;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Create calendar event data
  const createCalendarEvent = (item: ScheduleItem): CalendarEvent => {
    const endTime = calculateEndTime(item.startTime, item.durationMin);
    const startDateTime = formatDateTimeForGoogle(
      item.scheduledDate,
      item.startTime
    );
    const endDateTime = formatDateTimeForGoogle(item.scheduledDate, endTime);

    const title = `Học tập - Tuần ${item.weekNumber} - ${getDayName(
      item.dayOfWeek
    )}`;

    const description = `
📚 Buổi học tuần ${item.weekNumber}
📅 Ngày: ${formatDate(item.scheduledDate)} (${getDayName(item.dayOfWeek)})
⏰ Thời gian: ${item.startTime} - ${endTime} (${item.durationMin} phút)
📖 Số nội dung: ${item.contentIds.length}

📋 Danh sách nội dung:
${item.contentIds
  .map((contentId, index) => `${index + 1}. Nội dung ${contentId}`)
  .join("\n")}

🎯 Mục tiêu: Hoàn thành tất cả nội dung học trong buổi học này
📝 Ghi chú: Đây là lịch học được tạo tự động từ hệ thống Learning Path

---
Được tạo bởi Learning Management System
    `.trim();

    return {
      title,
      description,
      startDateTime,
      endDateTime,
      location: "Online Learning Platform",
    };
  };

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${event.startDateTime}/${event.endDateTime}`,
      details: event.description,
      location: event.location || "",
      sf: "true",
      output: "xml",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Handle single item addition
  const handleAddSingleItem = async () => {
    if (!scheduleItem) return;

    setIsGenerating(true);
    try {
      const event = createCalendarEvent(scheduleItem);
      const url = generateGoogleCalendarUrl(event);
      setGeneratedUrl(url);

      // Open Google Calendar in new tab
      window.open(url, "_blank");

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to generate calendar event:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle multiple items addition (week)
  const handleAddWeekItems = async () => {
    if (scheduleItems.length === 0) return;

    setIsGenerating(true);
    try {
      // Generate URLs for all items in the week
      const urls = scheduleItems.map((item) => {
        const event = createCalendarEvent(item);
        return generateGoogleCalendarUrl(event);
      });

      // Open all URLs (browsers may block multiple popups, so we'll open them with delay)
      urls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, "_blank");
        }, index * 500); // 500ms delay between each
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to generate calendar events:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Show temporary success message
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  // Generate ICS file for download
  const generateICSFile = (items: ScheduleItem[]) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Learning Management System//Learning Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    items.forEach((item, index) => {
      const event = createCalendarEvent(item);
      const uid = `learning-${item.weekNumber}-${item.dayOfWeek}-${index}@lms.com`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTART:${event.startDateTime}`,
        `DTEND:${event.endDateTime}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
        `LOCATION:${event.location}`,
        `STATUS:CONFIRMED`,
        `SEQUENCE:0`,
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    const blob = new Blob([icsContent.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `learning-schedule-week-${weekNumber || "all"}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSingleItemView = () => {
    if (!scheduleItem) return null;

    const event = createCalendarEvent(scheduleItem);
    const dayName = getDayName(scheduleItem.dayOfWeek);
    const formattedDate = formatDate(scheduleItem.scheduledDate);
    const endTime = calculateEndTime(
      scheduleItem.startTime,
      scheduleItem.durationMin
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thêm buổi học vào Google Calendar
          </h2>
          <p className="text-gray-600">
            Thêm buổi học này vào lịch Google Calendar của bạn để không bỏ lỡ
          </p>
        </div>

        {/* Event Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Xem trước sự kiện
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600">
                  Week {scheduleItem.weekNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-900">
                  {dayName}, {formattedDate}
                </p>
                <p className="text-sm text-gray-600">
                  {scheduleItem.startTime} - {endTime} (
                  {scheduleItem.durationMin} minutes)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <p className="text-gray-900">{event.location}</p>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">
                  {scheduleItem.contentIds.length} nội dung học
                </p>
                <div className="text-sm text-gray-600 mt-1">
                  {scheduleItem.contentIds
                    .slice(0, 3)
                    .map((contentId, index) => (
                      <div key={index}>• Nội dung {contentId}</div>
                    ))}
                  {scheduleItem.contentIds.length > 3 && (
                    <div>
                      • ... và {scheduleItem.contentIds.length - 3} nội dung
                      khác
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddSingleItem}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Mở Google Calendar
              </>
            )}
          </button>

          <button
            onClick={() => generateICSFile([scheduleItem])}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Tải file .ics
          </button>
        </div>

        {generatedUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Link đã được tạo
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(generatedUrl)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Copy className="w-4 h-4" />
                Sao chép
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    if (scheduleItems.length === 0) return null;

    const totalDuration = scheduleItems.reduce(
      (sum, item) => sum + item.durationMin,
      0
    );
    const totalContents = scheduleItems.reduce(
      (sum, item) => sum + item.contentIds.length,
      0
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Add week {weekNumber} into Google Calendar
          </h2>
          <p className="text-gray-600">
            Add all {scheduleItems.length} this week&apos;s classes on your
            calendar
          </p>
        </div>

        {/* Week Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Overview {weekNumber}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {scheduleItems.length}
              </div>
              <div className="text-sm text-gray-600">Lesson</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(totalDuration / 60)}h {totalDuration % 60}m
              </div>
              <div className="text-sm text-gray-600">Total time</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {totalContents}
              </div>
              <div className="text-sm text-gray-600">Learning content</div>
            </div>
          </div>

          {/* Schedule List */}
          <div className="space-y-2">
            {scheduleItems.map((item, index) => {
              const dayName = getDayName(item.dayOfWeek);
              const formattedDate = formatDate(item.scheduledDate);
              const endTime = calculateEndTime(
                item.startTime,
                item.durationMin
              );

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {dayName}, {formattedDate}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.startTime} - {endTime} • {item.contentIds.length}{" "}
                        Content
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.durationMin} minutes
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddWeekItems}
            disabled={isGenerating}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating {scheduleItems.length} event...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Add all to Google Calendar
              </>
            )}
          </button>

          <button
            onClick={() => generateICSFile(scheduleItems)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download .ics file
          </button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium mb-1">
                Note when adding multiple events
              </p>
              <p className="text-sm">
                Your browser may block multiple tabs from opening at once. If
                you don&apos;t see all your events, allow popups or use the .ics file
                download feature to import them into your calendar.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Google Calendar opened successfully!</span>
        </div>
      )}

      {/* Content */}
      {scheduleItem ? renderSingleItemView() : renderWeekView()}

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
           Close
          </button>
        </div>
      )}
    </div>
  );
}
