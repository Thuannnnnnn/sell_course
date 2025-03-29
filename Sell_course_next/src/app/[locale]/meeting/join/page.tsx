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

    if (!session?.user?.id) {
      setError("You must be logged in to join a meeting");
      return;
    }

    if (!meetingCode.trim()) {
      setError("Meeting code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await joinMeeting({
        meetingId: meetingCode,
        userId: session.user.id,
        hasCamera,
        hasMicrophone,
      });

      if (response.success) {
        // Redirect to the meeting room
        router.push(`/${locale}/meeting/${response.data.meetingId}`);
      } else {
        setError(response.message || "Failed to join meeting");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "An error occurred while joining the meeting"
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
      <h1 className="join-meeting-title">Join a Meeting</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleJoinMeeting} className="join-meeting-form">
        <div className="form-group">
          <label htmlFor="meetingCode" className="form-label">
            Meeting Code or ID*
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
              {hasCamera ? "Camera On" : "Camera Off"}
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
              {hasMicrophone ? "Microphone On" : "Microphone Off"}
            </span>
          </div>
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
            {loading ? "Joining..." : "Join Meeting"}
          </button>
        </div>
      </form>
    </div>
  );
}
