"use client";

import { useContext } from "react";
import { ToastContext } from "@/components/ui/toast";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
