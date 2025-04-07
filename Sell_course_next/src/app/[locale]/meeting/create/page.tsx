"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createMeeting } from "@/app/api/meeting/meeting";

export default function CreateMeetingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
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
      return;
    }

    if (formData.isScheduled && !formData.scheduledTime) {
      return;
    }

    setLoading(true);

    try {
      // Store the session token in localStorage if it's not already there
      if (session?.user?.token && typeof window !== "undefined") {
        localStorage.setItem("token", session.user.token);
      }

      // Không cần thêm hostId vì backend tự lấy từ token
      const response = await createMeeting({
        title: formData.title,
        description: formData.description,
        isScheduled: formData.isScheduled,
        scheduledTime: formData.isScheduled
          ? formData.scheduledTime
          : undefined,
        isRecorded: formData.isRecorded,
      });

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      if (!response.data.id) {
        throw new Error("Meeting ID not received from server");
      }

      if (!formData.isScheduled) {
        router.push(`/${locale}/meeting/${response.data.id}`);
      } else {
        router.push(`/${locale}/meeting`);
      }
    } catch (err) {
      console.error("Error creating meeting:", err);
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

      <form onSubmit={handleSubmit} className="create-meeting-form">
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
            placeholder="Enter meeting title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter meeting description"
            rows={3}
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            id="isScheduled"
            name="isScheduled"
            className="form-check-input"
            checked={formData.isScheduled}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isScheduled">
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
              required
            />
          </div>
        )}

        <div className="form-check mb-3">
          <input
            type="checkbox"
            id="isRecorded"
            name="isRecorded"
            className="form-check-input"
            checked={formData.isRecorded}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isRecorded">
            Record meeting
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Meeting"}
        </button>
      </form>
    </div>
  );
}
