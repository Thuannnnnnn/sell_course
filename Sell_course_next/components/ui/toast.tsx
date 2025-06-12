// components/ui/toast.tsx

import * as React from "react";

export type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
};

export type ToastActionElement = React.ReactElement;

export function toast({ title, description }: ToastProps) {
  // Giả định đang dùng native toast dev hoặc có thể tích hợp với một toast lib
  // Bạn có thể thay đoạn này bằng logic hiển thị toast custom
  console.log("Toast:", { title, description });

  // Hoặc show toast bằng cách bạn tự định nghĩa UI:
  const message = title ? `${title} - ${description}` : description;
  alert(message); // Tạm thời alert để debug, bạn thay bằng custom UI toast sau
}
