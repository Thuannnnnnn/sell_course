"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils"; // đảm bảo có helper `cn` hoặc thay bằng `clsx`

export const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
} | null>(null);

export type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [toastContent, setToastContent] = React.useState<ToastProps | null>(null);

  const showToast = (props: ToastProps) => {
    setToastContent(props);
    setOpen(false); // Reset trước khi mở mới
    setTimeout(() => setOpen(true), 10);
  };

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      <ToastPrimitive.Provider swipeDirection="up">
        {children}
        <ToastPrimitive.Root
          open={open}
          onOpenChange={setOpen}
          duration={toastContent?.duration || 3000}
          className={cn(
            // Position và layout
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
            "w-[350px] max-w-[90vw] rounded-lg shadow-xl px-4 py-3 border",
            // Background và text colors
            "bg-white dark:bg-gray-800",
            // Animation classes
            "data-[state=open]:animate-slide-in-from-top",
            "data-[state=closed]:animate-slide-out-to-top",
            "data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)]",
            "data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform",
            "data-[swipe=end]:animate-slide-out-to-top",
            // Variant styles
            toastContent?.variant === "destructive"
              ? "border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
              : "border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          )}
        >
          {toastContent?.title && (
            <ToastPrimitive.Title className="font-semibold text-sm mb-1">
              {toastContent.title}
            </ToastPrimitive.Title>
          )}
          {toastContent?.description && (
            <ToastPrimitive.Description className="text-sm opacity-90">
              {toastContent.description}
            </ToastPrimitive.Description>
          )}
          

        </ToastPrimitive.Root>
        
        <ToastPrimitive.Viewport className="fixed top-0 left-0 right-0 flex flex-col items-center p-4 gap-2 z-[999] pointer-events-none" />
      </ToastPrimitive.Provider>

      {/* Custom CSS cho animations */}
      <style jsx global>{`
        @keyframes slide-in-from-top {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-out-to-top {
          from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
        }

        .animate-slide-in-from-top {
          animation: slide-in-from-top 0.3s ease-out;
        }

        .animate-slide-out-to-top {
          animation: slide-out-to-top 0.2s ease-in;
        }

        /* Smooth bounce effect */
        @keyframes toast-bounce-in {
          0% {
            transform: translateX(-50%) translateY(-100%) scale(0.9);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) translateY(5px) scale(1.02);
          }
          100% {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
          }
        }

        .animate-toast-bounce-in {
          animation: toast-bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// Hook để sử dụng Toast
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}