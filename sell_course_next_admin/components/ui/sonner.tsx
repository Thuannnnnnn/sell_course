"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:shadow-lg", // Giữ nguyên màu nền mặc định, không thay đổi
          description: "group-[.toast]:text-muted-foreground", // Giữ nguyên màu mặc định cho description
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",

          // Áp dụng màu text cho toàn bộ toast (bao gồm cả icon và text)
          success: "group-[.toaster]:text-[#71CE85] border-[#C7FF02]", // Màu text cho success
          error: "group-[.toaster]:text-[#FF1B1A] border-[#E60001]", // Màu text cho error
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
