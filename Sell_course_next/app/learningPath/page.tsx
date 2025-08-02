"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningPlanData } from "../types/learningPath/learningPath";
import { createLearningPathAPI } from "../api/learningPath/learningPathAPI";
import LearningPathList from "@/components/learningPath/LearningPathList";
import LearningPathDisplay from "@/components/learningPath/LearningPathDisplay";
import CreateLearningPathModal from "@/components/learningPath/CreateLearningPathModal";

export default function LearningPathPage() {
  const [learningPlans, setLearningPlans] = useState<LearningPlanData[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlanData | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");

  const { data: session } = useSession();
  const userId = session?.user.id;
  const token = session?.accessToken;
  const userName = session?.user.name || "";

  useEffect(() => {
    if (userId && token) {
      checkExistingLearningPaths();
    }
  }, [userId, token]);

  const checkExistingLearningPaths = async () => {
    if (!userId || !token) return;

    try {
      setLoading(true);
      const api = createLearningPathAPI(token);
      const plans = await api.getLearningPathByUserId(userId);

      if (plans && plans.length > 0) {
        setLearningPlans(plans);
        setView("list");
      } else {
        // Không có learning path, hiển thị modal
        setShowModal(true);
      }
    } catch (error: any) {
      if (error.message === "NO_LEARNING_PATH") {
        // Không có learning path, hiển thị modal
        setShowModal(true);
      } else {
        console.error("Failed to fetch learning paths:", error);
        setError("Failed to load learning paths. Please try again.");
        toast.error("Failed to load learning paths");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPath = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSubmit = async () => {
    // Modal sẽ tự xử lý việc tạo learning path
    // Sau khi tạo xong, refresh lại danh sách
    await checkExistingLearningPaths();
    setShowModal(false);
  };

  const handleViewPlan = (plan: LearningPlanData) => {
    setSelectedPlan(plan);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedPlan(null);
    setView("list");
  };

  const handleDeletePlan = async (planId: string) => {
    if (!token) return;

    try {
      const api = createLearningPathAPI(token);
      await api.deleteLearningPath(planId);

      // Refresh danh sách
      await checkExistingLearningPaths();

      // Nếu đang xem plan bị xóa, quay về list
      if (selectedPlan?.planId === planId) {
        handleBackToList();
      }

      toast.success("Learning path deleted successfully");
    } catch (error) {
      console.error("Failed to delete learning path:", error);
      toast.error("Failed to delete learning path");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your learning paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Learning Paths
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={checkExistingLearningPaths} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === "list" && (
        <LearningPathList
          learningPlans={learningPlans}
          onCreateNew={handleCreateNewPath}
          onViewPlan={handleViewPlan}
          onDeletePlan={handleDeletePlan}
        />
      )}

      {view === "detail" && selectedPlan && userId && token && (
        <LearningPathDisplay
          learningPlan={selectedPlan}
          userId={userId}
          token={token}
          onBack={handleBackToList}
        />
      )}

      {showModal && userId && token && (
        <CreateLearningPathModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          userId={userId}
          userName={userName}
          token={token}
        />
      )}

      {/* Empty state khi không có learning path và không hiển thị modal */}
      {!loading && !error && learningPlans.length === 0 && !showModal && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Learning Paths Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first personalized learning path to get started.
            </p>
            <Button
              onClick={handleCreateNewPath}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Your First Learning Path
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
