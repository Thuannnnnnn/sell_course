"use client";

import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  courseId: string;
  contentIds: string[];
  weekNumber: number;
  scheduledDate: string;
}

interface NarrativeItem {
  template: string;
  bindings: {
    weekNumber?: number;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    contentId?: string;
    contentTitle?: string;
    contentTitles?: string;
    overview?: string;
    questions?: string;
    summary?: string;
  };
}

interface LearningPathData {
  scheduleItems: {
    scheduleData: ScheduleItem[];
    narrativeText: NarrativeItem[];
  };
}

interface LearningPathDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LearningPathData) => void;
  data: LearningPathData;
  isEditable?: boolean;
}

const DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function LearningPathDisplay({ 
  isOpen, 
  onClose, 
  onSave, 
  data, 
  isEditable = true 
}: LearningPathDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<LearningPathData>(data);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'Bạn có thay đổi chưa được lưu. Bạn có muốn lưu trước khi thoát không?'
      );
      if (confirmClose) {
        handleSave();
      } else {
        const confirmDiscard = window.confirm('Bạn có chắc chắn muốn bỏ qua các thay đổi?');
        if (confirmDiscard) {
          setEditedData(data);
          setHasUnsavedChanges(false);
          onClose();
        }
      }
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(editedData);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedData(data);
    setHasUnsavedChanges(false);
    setIsEditing(false);
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

  const updateScheduleItem = (
    index: number,
    field: keyof ScheduleItem,
    value: string | number | string[]
  ) => {
    const newScheduleData = [...editedData.scheduleItems.scheduleData];
    newScheduleData[index] = { ...newScheduleData[index], [field]: value };
    
    setEditedData({
      ...editedData,
      scheduleItems: {
        ...editedData.scheduleItems,
        scheduleData: newScheduleData
      }
    });
    setHasUnsavedChanges(true);
  };

  const formatTime = (startTime: string, durationMin: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = Math.floor((hours * 60 + minutes + durationMin) / 60);
    const endMinutes = (hours * 60 + minutes + durationMin) % 60;
    
    return `${startTime} - ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const renderNarrativeContent = (item: NarrativeItem, index: number) => {
    let content = item.template;
    Object.entries(item.bindings).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    const getIcon = () => {
      if (content.includes('Tổng quan')) return <FileText className="w-5 h-5 text-blue-500" />;
      if (content.includes('câu hỏi')) return <HelpCircle className="w-5 h-5 text-purple-500" />;
      if (content.includes('quiz') || content.includes('kiểm tra')) return <Target className="w-5 h-5 text-green-500" />;
      return <BookOpen className="w-5 h-5 text-gray-500" />;
    };

    const itemId = `narrative-${index}`;
    const isExpanded = expandedItems.has(itemId);

    return (
      <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleExpanded(itemId)}
        >
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <p className={`text-gray-700 leading-relaxed ${!isExpanded && content.length > 150 ? 'line-clamp-2' : ''}`}>
                {isExpanded || content.length <= 150 ? content : `${content.substring(0, 150)}...`}
              </p>
            </div>
            {content.length > 150 && (
              <button className="text-gray-400 hover:text-gray-600">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Learning Path của bạn</h2>
            </div>
            <div className="flex items-center gap-2">
              {isEditable && (
                <>
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEdit}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Chỉnh sửa
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Lịch học của bạn
            </h3>
            
            <div className="grid gap-4">
              {editedData.scheduleItems.scheduleData.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {item.weekNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Tuần {item.weekNumber}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {DAY_NAMES[item.dayOfWeek]} - {new Date(item.scheduledDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4" />
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={item.startTime}
                              onChange={(e) => updateScheduleItem(index, 'startTime', e.target.value)}
                              className="px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              value={item.durationMin}
                              onChange={(e) => updateScheduleItem(index, 'durationMin', parseInt(e.target.value))}
                              className="px-2 py-1 border rounded text-sm w-20"
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
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Nội dung học:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.contentIds.map((contentId, contentIndex) => (
                        <span
                          key={contentIndex}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          Nội dung {contentIndex + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Content */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Chi tiết nội dung học
            </h3>
            
            <div className="space-y-4">
              {editedData.scheduleItems.narrativeText.map((item, index) => 
                renderNarrativeContent(item, index)
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border-t border-yellow-200 p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Bạn có thay đổi chưa được lưu</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

