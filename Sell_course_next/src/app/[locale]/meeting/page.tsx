"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FaPlus,
  FaVideo,
  FaCalendarAlt,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { getUserMeetings, Meeting } from "@/app/api/meeting/meeting";
import { format } from "date-fns";

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [activeTab, setActiveTab] = useState<"hosted" | "participated">(
    "hosted"
  );
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(
    async (type: "hosted" | "participated") => {
      if (!session?.user?.user_id) return;

      setLoading(true);
      try {
        const response = await getUserMeetings(session.user.user_id, type);
        setMeetings(response.data || []);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user?.user_id) {
      fetchMeetings(activeTab);
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, activeTab, router, fetchMeetings]);

  const handleCreateMeeting = () => {
    router.push(`/${locale}/meeting/create`);
  };

  const handleJoinMeeting = () => {
    router.push(`/${locale}/meeting/join`);
  };

  const handleJoinExistingMeeting = (meetingId: string) => {
    router.push(`/${locale}/meeting/${meetingId}`);
  };

  const formatMeetingDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy • HH:mm");
  };

  if (status === "loading") {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="meetings-list-container">
      <div className="meetings-list-header">
        <h1 className="meetings-list-title">Your Meetings</h1>
        <div>
          <button className="btn-primary" onClick={handleCreateMeeting}>
            <FaPlus className="me-2" /> Create Meeting
          </button>
          <button className="btn-secondary ms-2" onClick={handleJoinMeeting}>
            Join Meeting
          </button>
        </div>
      </div>

      <div className="meetings-tabs">
        <div
          className={`meetings-tab ${activeTab === "hosted" ? "active" : ""}`}
          onClick={() => setActiveTab("hosted")}
        >
          Meetings You Host
        </div>
        <div
          className={`meetings-tab ${
            activeTab === "participated" ? "active" : ""
          }`}
          onClick={() => setActiveTab("participated")}
        >
          Meetings You Joined
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-4">
          {activeTab === "hosted"
            ? "You haven't created any meetings yet."
            : "You haven't joined any meetings yet."}
        </div>
      ) : (
        <div className="meetings-list">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-card-info">
                <h3 className="meeting-card-title">{meeting.title}</h3>
                <div className="meeting-card-details">
                  {meeting.isScheduled ? (
                    <span>
                      <FaCalendarAlt className="me-1" />{" "}
                      {formatMeetingDate(
                        meeting.scheduledTime || meeting.startTime
                      )}
                    </span>
                  ) : (
                    <span>
                      <FaClock className="me-1" />{" "}
                      {formatMeetingDate(meeting.startTime)}
                    </span>
                  )}
                  <span>
                    <FaUser className="me-1" /> Host:{" "}
                    {meeting.host?.username || "Unknown"}
                  </span>
                  {meeting.isActive && (
                    <span className="badge bg-success">Active</span>
                  )}
                </div>
              </div>
              <div className="meeting-card-actions">
                {meeting.isActive ? (
                  <button
                    className="btn-primary"
                    onClick={() => handleJoinExistingMeeting(meeting.id)}
                  >
                    <FaVideo className="me-1" /> Join Now
                  </button>
                ) : (
                  <button className="btn-secondary" disabled>
                    Meeting Ended
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
