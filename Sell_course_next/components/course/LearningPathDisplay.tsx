"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Target,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  ScheduleItem,
  NarrativeItem,
  LearningPathData,
  validateScheduleItem,
  calculateEndTime,
  formatDate,
  isLearningPathData,
} from "@/app/types/learningPath/learningPath";
import { ContentResponse } from "@/app/types/Course/Lesson/Lessons";
import { fetchContentsByIds } from "@/app/api/courses/lessons/content";

interface LearningPathDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LearningPathData) => Promise<void>;
  data: LearningPathData;
  isEditable?: boolean;
  planId?: string | null;
  isExisting?: boolean;
  token: string;
}

export default function UpdatedLearningPathDisplay({
  isOpen,
  onClose,
  onSave,
  data,
  isEditable = true,
  planId = null,
  isExisting = false,
  token,
}: LearningPathDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<LearningPathData>(data);
  // State mới: Lưu trữ toàn bộ contentId gốc của lộ trình học
  const [allCourseContentIds, setAllCourseContentIds] = useState<string[]>([]);
  // State mới: Lưu trữ các contentId chưa được gán vào buổi học nào
  const [availableContentIds, setAvailableContentIds] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string[]>
  >({});
  const [contentDetails, setContentDetails] = useState<
    Record<string, ContentResponse>
  >({});
  const isSaveDisabled = isSaving || (!hasUnsavedChanges && !!planId);

  useEffect(() => {
    // Gom tất cả contentIds từ tất cả các buổi học vào một mảng duy nhất
    const allContentIds = editedData.scheduleItems.scheduleData.flatMap(
      (item) => item.contentIds
    );

    // Lọc ra những ID chưa có trong state contentDetails để tránh gọi API thừa
    const uniqueNewIds = Array.from(new Set(allContentIds)).filter(
      (id) => id && !contentDetails[id]
    );

    if (uniqueNewIds.length > 0) {
      const fetchDetails = async () => {
        try {
          // Gọi API với các ID mới
          const contents = await fetchContentsByIds(uniqueNewIds, token);

          // Cập nhật state với dữ liệu mới nhận được
          const newDetails: Record<string, ContentResponse> = {};
          contents.forEach((content) => {
            // Giả sử response.data trả về mảng object có id và name
            newDetails[content.contentId] = {
              contentId: content.contentId,
              contentType: content.contentType,
              description: content.description,
              contentName: content.contentName,
              createdAt: content.createdAt,
              order: content.order,
            };
          });

          setContentDetails((prevDetails) => ({
            ...prevDetails,
            ...newDetails,
          }));
        } catch (error) {
          console.error("Failed to fetch content details:", error);
          // Có thể thêm xử lý lỗi ở đây, ví dụ: hiển thị thông báo
        }
      };

      fetchDetails();
    }
  }, [editedData.scheduleItems.scheduleData, contentDetails]);
  // Update edited data when prop data changes
  useEffect(() => {
    if (isLearningPathData(data)) {
      const originalIds = data.scheduleItems.scheduleData.flatMap(
        (item) => item.contentIds
      );
      const uniqueOriginalIds = Array.from(new Set(originalIds));
      setAllCourseContentIds(uniqueOriginalIds);
      setEditedData(data);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    }
  }, [data]);

  useEffect(() => {
    // 2. Lấy tất cả contentId hiện đang được sử dụng trong `editedData`
    const currentlyAssignedIds = new Set(
      editedData.scheduleItems.scheduleData.flatMap((item) => item.contentIds)
    );

    // 3. Tìm ra những ID có trong danh sách gốc nhưng chưa được gán
    const availableIds = allCourseContentIds.filter(
      (id) => !currentlyAssignedIds.has(id)
    );
    setAvailableContentIds(availableIds);
  }, [editedData.scheduleItems.scheduleData, allCourseContentIds]);
  const validateAllScheduleItems = (): boolean => {
    const errors: Record<number, string[]> = {};
    let hasErrors = false;

    editedData.scheduleItems.scheduleData.forEach((item, index) => {
      const itemErrors = validateScheduleItem(item);
      if (itemErrors.length > 0) {
        errors[index] = itemErrors;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmSave = window.confirm(
        "Bạn có thay đổi chưa được lưu. Bạn có muốn lưu trước khi thoát không?"
      );
      if (confirmSave) {
        handleSave();
        return;
      }

      const confirmDiscard = window.confirm(
        "Bạn có chắc chắn muốn bỏ qua các thay đổi?"
      );
      if (!confirmDiscard) {
        return;
      }
    }

    setEditedData(data);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setValidationErrors({});
    onClose();
  };

  const handleSave = async () => {
    if (!validateAllScheduleItems()) {
      toast.error("Vui lòng sửa các lỗi validation trước khi lưu.", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Update narrativeText with current schedule data
      const updatedNarrativeText = editedData.scheduleItems.narrativeText;

      const updatedData: LearningPathData = {
        ...editedData,
        scheduleItems: {
          ...editedData.scheduleItems,
          narrativeText: updatedNarrativeText,
        },
      };

      await onSave(updatedData);
      setHasUnsavedChanges(false);
      setIsEditing(false);
      setValidationErrors({});
    } catch {
      toast.error("Có lỗi xảy ra khi lưu. Vui lòng thử lại.", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedData(data);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setValidationErrors({});
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const updateScheduleItem = <K extends keyof ScheduleItem>(
    index: number,
    field: K,
    value: ScheduleItem[K]
  ) => {
    const newScheduleData = [...editedData.scheduleItems.scheduleData];
    newScheduleData[index] = { ...newScheduleData[index], [field]: value };

    const currentItem = { ...newScheduleData[index] };

    // Cập nhật trường đang thay đổi
    currentItem[field] = value;

    // Nếu ngày cụ thể thay đổi, tự động cập nhật thứ trong tuần
    if (field === "scheduledDate") {
      // value ở đây được TypeScript hiểu là string, không cần ép kiểu
      const date = new Date(value as string);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + timezoneOffset);
      currentItem.dayOfWeek = adjustedDate.getDay();
    }

    newScheduleData[index] = currentItem;

    setEditedData({
      ...editedData,
      scheduleItems: {
        ...editedData.scheduleItems,
        scheduleData: newScheduleData,
      },
    });
    setHasUnsavedChanges(true);

    // Clear validation errors for this item
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  const addScheduleItem = () => {
    const schedule = editedData.scheduleItems.scheduleData;
    const newScheduledDate = new Date();

    if (schedule.length > 0) {
      const lastItem = [...schedule].sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      )[schedule.length - 1];

      const lastDate = new Date(lastItem.scheduledDate);

      newScheduledDate.setDate(lastDate.getDate() + 1);
    }

    const formattedDate = newScheduledDate.toISOString().split("T")[0];

    const newItem: ScheduleItem = {
      dayOfWeek: newScheduledDate.getDay(),
      startTime: "09:00",
      durationMin: 60,
      courseId: editedData.scheduleItems.scheduleData[0]?.courseId || "",
      contentIds: [],
      weekNumber: editedData.scheduleItems.scheduleData.length + 1,
      scheduledDate: formattedDate,
    };

    const newScheduleData = [...schedule, newItem].sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime()
    );

    setEditedData({
      ...editedData,
      scheduleItems: {
        ...editedData.scheduleItems,
        scheduleData: newScheduleData,
      },
    });
    setHasUnsavedChanges(true);
  };

  const removeScheduleItem = (index: number) => {
    const newScheduleData = editedData.scheduleItems.scheduleData.filter(
      (_, i) => i !== index
    );

    setEditedData({
      ...editedData,
      scheduleItems: {
        ...editedData.scheduleItems,
        scheduleData: newScheduleData,
      },
    });
    setHasUnsavedChanges(true);

    // Remove validation errors for this item
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  const addContentId = (scheduleIndex: number, contentIdToAdd: string) => {
    // Chỉ thêm nếu contentIdToAdd thực sự tồn tại
    if (!contentIdToAdd) return;

    const currentItem = editedData.scheduleItems.scheduleData[scheduleIndex];
    const newContentIds = [...currentItem.contentIds, contentIdToAdd];

    updateScheduleItem(scheduleIndex, "contentIds", newContentIds);
  };

  const removeContentId = (scheduleIndex: number, contentIndex: number) => {
    const currentItem = editedData.scheduleItems.scheduleData[scheduleIndex];
    const newContentIds = currentItem.contentIds.filter(
      (_, i) => i !== contentIndex
    );

    updateScheduleItem(scheduleIndex, "contentIds", newContentIds);
  };

  const formatTime = (startTime: string, durationMin: number) => {
    const endTime = calculateEndTime(startTime, durationMin);
    return `${startTime} - ${endTime}`;
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(editedData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `learning-path-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const renderNarrativeContent = (item: NarrativeItem, index: number) => {
    let content = item.template;
    Object.entries(item.bindings).forEach(([key, value]) => {
      content = content.replace(
        new RegExp(`{{${key}}}`, "g"),
        String(value || "")
      );
    });

    const getIcon = () => {
      if (content.includes("Tổng quan"))
        return <FileText className="w-5 h-5 text-blue-500" />;
      if (content.includes("câu hỏi"))
        return <HelpCircle className="w-5 h-5 text-purple-500" />;
      if (content.includes("quiz") || content.includes("kiểm tra"))
        return <Target className="w-5 h-5 text-green-500" />;
      return <BookOpen className="w-5 h-5 text-gray-500" />;
    };

    const itemId = `narrative-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const shouldShowToggle = content.length > 150;

    return (
      <div
        key={index}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div
          className={`p-4 ${
            shouldShowToggle ? "cursor-pointer" : ""
          } hover:bg-gray-50 transition-colors`}
          onClick={() => shouldShowToggle && toggleExpanded(itemId)}
        >
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <p
                className={`text-gray-700 leading-relaxed ${
                  !isExpanded && shouldShowToggle ? "line-clamp-2" : ""
                }`}
              >
                {isExpanded || !shouldShowToggle
                  ? content
                  : `${content.substring(0, 150)}...`}
              </p>
            </div>
            {shouldShowToggle && (
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleItemCard = (item: ScheduleItem, index: number) => {
    const errors = validationErrors[index] || [];
    const hasErrors = errors.length > 0;

    return (
      <div
        key={index}
        className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border transition-shadow ${
          hasErrors
            ? "border-red-300 bg-red-50"
            : "border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold ${
                hasErrors ? "bg-red-500" : "bg-blue-500"
              }`}
            >
              {item.weekNumber}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Tuần {item.weekNumber}
              </h4>
              <p className="text-sm text-gray-600">
                {formatDate(item.scheduledDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) =>
                        updateScheduleItem(index, "startTime", e.target.value)
                      }
                      className={`px-2 py-1 border rounded text-sm focus:ring-2 focus:border-blue-500 ${
                        hasErrors
                          ? "border-red-300 focus:ring-red-500"
                          : "focus:ring-blue-500"
                      }`}
                    />
                    <input
                      type="number"
                      value={item.durationMin}
                      onChange={(e) =>
                        updateScheduleItem(
                          index,
                          "durationMin",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`px-2 py-1 border rounded text-sm w-20 focus:ring-2 focus:border-blue-500 ${
                        hasErrors
                          ? "border-red-300 focus:ring-red-500"
                          : "focus:ring-blue-500"
                      }`}
                      min="1"
                    />
                    <span className="text-sm">phút</span>
                  </div>
                ) : (
                  <span className="font-medium">
                    {formatTime(item.startTime, item.durationMin)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {item.durationMin} phút
              </p>
            </div>
            {isEditing && (
              <button
                onClick={() => removeScheduleItem(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Xóa buổi học"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {hasErrors && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <AlertCircle className="w-4 h-4" />
              Lỗi validation:
            </div>
            <ul className="text-sm text-red-600 list-disc list-inside">
              {errors.map((error, errorIndex) => (
                <li key={errorIndex}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Schedule Details */}
        {isEditing && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày học cụ thể
              </label>
              <input
                type="date"
                value={item.scheduledDate}
                onChange={(e) =>
                  updateScheduleItem(index, "scheduledDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Nội dung học ({item.contentIds.length} nội dung):
            </p>
            {/* THAY ĐỔI LOGIC NÚT THÊM NỘI DUNG */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <select
                  id={`add-content-select-${index}`}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  // Dùng giá trị rỗng để không có gì được chọn mặc định
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Chọn nội dung --
                  </option>
                  {availableContentIds.map((id) => (
                    <option key={id} value={id}>
                      {contentDetails[id]?.contentName || id}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const select = document.getElementById(
                      `add-content-select-${index}`
                    ) as HTMLSelectElement;
                    if (select.value) {
                      addContentId(index, select.value);
                      // Reset dropdown sau khi thêm
                      select.value = "";
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  // Vô hiệu hóa nếu không còn nội dung nào để thêm
                  disabled={availableContentIds.length === 0}
                >
                  <Plus className="w-3 h-3" />
                  Thêm
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {item.contentIds.map((contentId, contentIndex) => {
              const detail = contentDetails[contentId];
              const displayName = detail
                ? detail.contentName
                : `ID: ${contentId}`;

              return (
                <div
                  key={contentIndex}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {/* BỎ Ô INPUT, CHỈ HIỂN THỊ TÊN */}
                  <span>{displayName}</span>

                  {isEditing && (
                    <button
                      onClick={() => removeContentId(index, contentIndex)}
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
            {item.contentIds.length === 0 && (
              <span className="text-gray-400 text-sm italic">
                Dont have content yet.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <h2 className="text-2xl font-bold">
                {isExisting ? "Your Learning Path" : "New Learning Path"}
              </h2>
              {planId && (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">You have unsaved changes</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Nút Lưu Learning Path - hiển thị khi không ở chế độ edit */}
              {isEditable && !isEditing && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || (!hasUnsavedChanges && !!planId)}
                  className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {planId ? "Saved" : "Save Learning Path"}
                    </>
                  )}
                </Button>
              )}

              {/* Nút Xuất JSON - chỉ hiển thị khi đã có data */}
              {editedData.scheduleItems.scheduleData.length > 0 && (
                <Button
                  onClick={exportToJSON}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              )}

              {isEditable && (
                <>
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {planId ? "Cập nhật" : "Lưu mới"}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEdit}
                      disabled={isSaveDisabled}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Schedule Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Your class schedule ({
                  editedData.scheduleItems.scheduleData.length
                }{" "}
                session)
              </h3>
              {isEditing && (
                <Button
                  onClick={addScheduleItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add a lesson
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {editedData.scheduleItems.scheduleData.length > 0 ? (
                editedData.scheduleItems.scheduleData.map((item, index) =>
                  renderScheduleItemCard(item, index)
                )
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                      No class schedule yet.{" "}
                    {isEditing && 'Nhấn "Thêm buổi học" để bắt đầu.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Content */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Course content details
            </h3>

            <div className="space-y-4">
              {editedData.scheduleItems.narrativeText.length > 0 ? (
                editedData.scheduleItems.narrativeText.map((item, index) =>
                  renderNarrativeContent(item, index)
                )
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No detailed content yet. Content will be generated automatically when you save your schedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {(hasUnsavedChanges || Object.keys(validationErrors).length > 0) && (
          <div
            className={`border-t p-4 ${
              Object.keys(validationErrors).length > 0
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 ${
                  Object.keys(validationErrors).length > 0
                    ? "text-red-800"
                    : "text-yellow-800"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {Object.keys(validationErrors).length > 0
                    ? `Có ${
                        Object.keys(validationErrors).length
                      } lỗi validation cần sửa.`
                    : "Bạn có thay đổi chưa được lưu. Nhớ lưu lại trước khi thoát."}
                </span>
              </div>
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSave}
                  disabled={
                    isSaving || Object.keys(validationErrors).length > 0
                  }
                  className={`${
                    Object.keys(validationErrors).length > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  } text-white`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
