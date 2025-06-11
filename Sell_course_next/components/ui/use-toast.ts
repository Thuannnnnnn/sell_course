// components/ui/use-toast.ts

import * as React from "react";
import { toast as defaultToast } from "@/components/ui/toast";

export function useToast() {
  return {
    toast: defaultToast,
  };
}
