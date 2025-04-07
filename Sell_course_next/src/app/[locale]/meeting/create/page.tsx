"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createMeeting } from "@/app/api/meeting/meeting";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function CreateMeetingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("Meeting");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isScheduled: false,
    scheduledTime: "",
    isRecorded: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.user_id) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t("create_meeting.meeting_title"));
      return;
    }

    if (formData.isScheduled && !formData.scheduledTime) {
      toast.error(t("create_meeting.scheduled_time"));
      return;
    }

    setLoading(true);

    try {
      // Ensure token is stored in localStorage
      if (session?.user?.token) {
        localStorage.setItem("token", session.user.token);
      } else {
        throw new Error("No authentication token available");
      }

      const response = await createMeeting({
        title: formData.title,
        description: formData.description,
        isScheduled: formData.isScheduled,
        scheduledTime: formData.isScheduled
          ? formData.scheduledTime
          : undefined,
        isRecorded: formData.isRecorded,
      });

      if (!response.data) {
        throw new Error(t("error.create_meeting"));
      }

      if (!response.data.id) {
        throw new Error(t("error.create_meeting"));
      }

      if (!formData.isScheduled) {
        router.push(`/${locale}/meeting/${response.data.id}`);
      } else {
        router.push(`/${locale}/meeting`);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      const errorMessage = error instanceof Error ? error.message : t("error.create_meeting");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  return (
    <div className="create-meeting-container">
      <h1 className="create-meeting-title">{t("createTitle")}</h1>

      <form onSubmit={handleSubmit} className="create-meeting-form">
        <div className="form-group">
          <label htmlFor="title">{t("meetingTitle")}</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            placeholder={t("meetingTitle")}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{t("description")}</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder={t("description")}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="isScheduled"
              name="isScheduled"
              className="checkbox-input"
              checked={formData.isScheduled}
              onChange={handleChange}
            />
            {t("scheduleForLater")}
          </label>
        </div>

        {formData.isScheduled && (
          <div className="form-group">
            <label htmlFor="scheduledTime">{t("scheduledTime")}</label>
            <input
              type="datetime-local"
              id="scheduledTime"
              name="scheduledTime"
              className="form-control"
              value={formData.scheduledTime}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="isRecorded"
              name="isRecorded"
              className="checkbox-input"
              checked={formData.isRecorded}
              onChange={handleChange}
            />
            {t("recordMeeting")}
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/meeting`)}
            className="cancel-button"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? t("creating") : t("startMeetingNow")}
          </button>
        </div>
      </form>
    </div>
  );
}
