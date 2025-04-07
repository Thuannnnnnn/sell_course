"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { joinMeeting } from "@/app/api/meeting/meeting";
import { useTranslations } from "next-intl";

export default function JoinMeetingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("Meeting");
  const [meetingCode, setMeetingCode] = useState("");
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.user_id) {
      setError(t("error.login_required"));
      return;
    }

    if (!meetingCode.trim()) {
      setError(t("error.meeting_code_required"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await joinMeeting({
        meetingCode: meetingCode,
        hasCamera,
        hasMicrophone,
      });

      if (response && response.meetingId) {
        router.push(`/${locale}/meeting/${response.meetingId}`);
      } else {
        setError(t("error.join_meeting"));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          t("error.join_meeting")
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
    <div className="join-meeting-container">
      <h1 className="join-meeting-title">{t("join_meeting.title")}</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {t("error.join_meeting")}
        </div>
      )}

      <form onSubmit={handleJoinMeeting} className="join-meeting-form">
        <div className="form-group">
          <label htmlFor="meetingCode" className="form-label">
            {t("join_meeting.code_label")}*
          </label>
          <input
            type="text"
            id="meetingCode"
            className="form-control"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            placeholder="Enter meeting code"
            required
          />
        </div>

        <div className="join-meeting-options">
          <div
            className={`option-btn ${hasCamera ? "active" : ""}`}
            onClick={() => setHasCamera(!hasCamera)}
          >
            {hasCamera ? (
              <FaVideo className="option-icon" />
            ) : (
              <FaVideoSlash className="option-icon" />
            )}
            <span className="option-label">
              {hasCamera
                ? t("join_meeting.camera_on")
                : t("join_meeting.camera_off")}
            </span>
          </div>

          <div
            className={`option-btn ${hasMicrophone ? "active" : ""}`}
            onClick={() => setHasMicrophone(!hasMicrophone)}
          >
            {hasMicrophone ? (
              <FaMicrophone className="option-icon" />
            ) : (
              <FaMicrophoneSlash className="option-icon" />
            )}
            <span className="option-label">
              {hasMicrophone
                ? t("join_meeting.mic_on")
                : t("join_meeting.mic_off")}
            </span>
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push(`/${locale}/meeting`)}
          >
            {t("join_meeting.cancel")}
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t("join_meeting.joining") : t("join_meeting.join")}
          </button>
        </div>
      </form>
    </div>
  );
}
