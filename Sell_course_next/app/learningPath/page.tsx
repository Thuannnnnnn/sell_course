"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LearningPlanData } from "../types/learningPath/learningPath";
import { createLearningPathAPI } from "../api/learningPath/learningPathAPI";
import LearningPathList from "@/components/learningPath/LearningPathList";
import LearningPathDisplay from "@/components/learningPath/LearningPathDisplay";
import CreateLearningPathModal from "@/components/learningPath/CreateLearningPathModal";
import LearningPathRoadmap from "@/components/learningPath/LearningPathRoadmap";

type ViewMode = "roadmap" | "list" | "display";

export default function LearningPathPage() {
  const { data: session } = useSession();

  const [learningPlans, setLearningPlans] = useState<LearningPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");
  const [selectedPlan, setSelectedPlan] = useState<LearningPlanData | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userId = session?.user.id || "";
  const token = session?.accessToken || "";
  const userName = session?.user.name || "";
  const api = createLearningPathAPI(token);
  useEffect(() => {
    fetchLearningPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  const fetchLearningPlans = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const plans = await api.getLearningPathByUserId(userId);
      setLearningPlans(plans);
    } catch (error) {
      console.error("Failed to fetch learning plans:", error);
      if (error instanceof Error && error.message.includes("404")) {
        // No learning paths found, this is normal for new users
        setLearningPlans([]);
      } else {
        toast.error("Failed to load learning paths");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleViewPlan = (plan: LearningPlanData) => {
    setSelectedPlan(plan);
    setViewMode("display");
  };

  const handleViewCourse = (plan: LearningPlanData) => {
    setSelectedPlan(plan);
    setViewMode("display");
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await api.deleteLearningPath(planId);
      toast.success("Learning path deleted successfully");
      await fetchLearningPlans();
    } catch (error) {
      console.error("Failed to delete learning path:", error);
      toast.error("Failed to delete learning path");
    }
  };

  const handleBackToRoadmap = () => {
    setSelectedPlan(null);
    setViewMode("roadmap");
  };

  const handleModalSubmit = async () => {
    await fetchLearningPlans();
    setShowCreateModal(false);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handleSwitchView = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedPlan(null);
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

  // Render based on current view mode
  if (viewMode === "display" && selectedPlan) {
    return (
      <>
        <LearningPathDisplay
          learningPlan={selectedPlan}
          userId={userId || ""}
          token={token}
          onBack={handleBackToRoadmap}
        />
        <CreateLearningPathModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          userId={userId || ""}
          userName={userName}
          token={token}
          existingLearningPlans={learningPlans}
        />
      </>
    );
  }

  if (viewMode === "list") {
    return (
      <>
        <div className="mb-4 p-4 bg-white border-b">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => handleSwitchView("roadmap")}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Switch to Roadmap View
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">List View</span>
          </div>
        </div>
        <LearningPathList
          learningPlans={learningPlans}
          onCreateNew={handleCreateNew}
          onViewPlan={handleViewPlan}
          onDeletePlan={handleDeletePlan}
          updatePlan={fetchLearningPlans}
          userId={userId || ""}
          token={token}
        />
        <CreateLearningPathModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          userId={userId || ""}
          userName={userName}
          token={token}
          existingLearningPlans={learningPlans}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 p-4 bg-white border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-gray-600">Roadmap View</span>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => handleSwitchView("list")}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Switch to List View
          </button>
        </div>
      </div>
      <LearningPathRoadmap
        learningPlans={learningPlans}
        onCreateNew={handleCreateNew}
        onViewCourse={handleViewCourse}
        onDeletePlan={handleDeletePlan}
        updatePlan={fetchLearningPlans}
        userId={userId || ""}
        token={token}
      />
      <CreateLearningPathModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        userId={userId || ""}
        userName={userName}
        token={token}
        existingLearningPlans={learningPlans}
      />
    </>
  );
}
