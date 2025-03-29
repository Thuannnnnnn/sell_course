"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createMeeting } from "@/app/api/meeting/meeting";
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
  const [error, setError] = useState("");

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
      setError("You must be logged in to create a meeting");
      return;
    }

    if (!formData.title.trim()) {
      setError("Meeting title is required");
      return;
    }

    if (formData.isScheduled && !formData.scheduledTime) {
      setError("Scheduled time is required for scheduled meetings");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createMeeting({
        ...formData,
        hostId: session?.user?.user_id,
      });

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      if (!response.data.id) {
        throw new Error("Meeting ID not received from server");
      }

      // If meeting is created successfully and is not scheduled for future,
      // redirect to the meeting room
      if (!formData.isScheduled) {
        router.push(`/${locale}/meeting/${response.data.id}`);
      } else {
        // Otherwise, redirect to meetings list
        router.push(`/${locale}/meeting`);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "An error occurred while creating the meeting"
      );
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
      <h1 className="create-meeting-title">Create a New Meeting</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Meeting Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            id="isScheduled"
            name="isScheduled"
            className="form-check-input"
            checked={formData.isScheduled}
            onChange={handleChange}
          />
          <label htmlFor="isScheduled" className="form-check-label">
            Schedule for later
          </label>
        </div>

        {formData.isScheduled && (
          <div className="form-group">
            <label htmlFor="scheduledTime" className="form-label">
              Scheduled Time*
            </label>
            <input
              type="datetime-local"
              id="scheduledTime"
              name="scheduledTime"
              className="form-control"
              value={formData.scheduledTime}
              onChange={handleChange}
              required={formData.isScheduled}
            />
          </div>
        )}

        <div className="form-check">
          <input
            type="checkbox"
            id="isRecorded"
            name="isRecorded"
            className="form-check-input"
            checked={formData.isRecorded}
            onChange={handleChange}
          />
          <label htmlFor="isRecorded" className="form-check-label">
            Record this meeting
          </label>
        </div>

        <div className="mt-4 d-flex justify-content-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push(`/${locale}/meeting`)}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Creating..."
              : formData.isScheduled
              ? "Schedule Meeting"
              : "Start Meeting Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
