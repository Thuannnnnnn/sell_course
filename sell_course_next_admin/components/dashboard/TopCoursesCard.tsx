"use client";
import React from "react";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import { getMockAnalytics } from "../../lib/mock-data";

export function TopCoursesCard() {
  const analytics = getMockAnalytics();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border h-fit">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold">Khóa học hàng đầu</h2>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {analytics.topCourses.map((course, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-brand-primary">
                    {index + 1}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{course.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground ml-8">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{course.students.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{formatCurrency(course.revenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <button className="w-full py-2 text-sm text-center text-primary hover:text-primary/80">
          Xem tất cả khóa học
        </button>
      </div>
    </div>
  );
}