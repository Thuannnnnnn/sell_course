'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertTriangle, X } from 'lucide-react';
import { Badge } from '../ui/badge';

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  courseName: string;
  loading?: boolean;
}

const COMMON_REJECTION_REASONS = [
  "Content does not meet quality standards",
  "Poor video/audio quality",
  "Insufficient course details provided",
  "Content violates copyright policies",
  "Lesson structure is not logical",
  "Missing supporting materials",
  "Course description is inaccurate",
];

export function RejectionDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  courseName,
  loading = false 
}: RejectionDialogProps) {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    // Validation
    const newErrors: string[] = [];
    
    if (!reason.trim()) {
      newErrors.push('Please provide a rejection reason');
    } else if (reason.trim().length < 10) {
      newErrors.push('Reason must be at least 10 characters');
    } else if (reason.trim().length > 500) {
      newErrors.push('Reason must not exceed 500 characters');
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      await onConfirm(reason.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setReason('');
    setErrors([]);
    onOpenChange(false);
  };

  const selectCommonReason = (commonReason: string) => {
    setReason(commonReason);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-red-800">
                Reject Course
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                You are rejecting the course: <strong>&quot;{courseName}&quot;</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Common reasons */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              💡 Common reasons (click to select quickly):
            </Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_REJECTION_REASONS.map((commonReason, index) => (
                <Badge
                  key={index}
                  variant={reason === commonReason ? "destructive" : "secondary"}
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors px-3 py-1"
                  onClick={() => selectCommonReason(commonReason)}
                >
                  {commonReason}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom reason input */}
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              📝 Detailed rejection reason: <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter specific rejection reason... (at least 10 characters)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors([]);
              }}
              rows={4}
              className={`mt-2 resize-none ${errors.length > 0 ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {reason.length}/500 characters
              </span>
            </div>
          </div>

          {/* Warning note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  ⚠️ Important Notes:
                </p>
                <ul className="text-amber-700 space-y-1 list-disc list-inside">
                  <li>Instructor will receive a notification with this reason</li>
                  <li>Course status will be changed to &quot;REJECTED&quot;</li>
                  <li>Instructor can fix issues and resubmit for review</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Confirm Rejection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}