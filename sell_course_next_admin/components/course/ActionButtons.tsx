// app/(admin)/courses/ActionButtons.tsx
"use client";

import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";

export function ActionButtons({
  courseId,
  onUpdate,
  onDelete,
}: {
  courseId: string;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="icon" onClick={() => onUpdate(courseId)}>
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(courseId)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
