"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FaVideo, FaPlus, FaCalendarAlt, FaHistory } from "react-icons/fa";
import {
  getHostedMeetings,
  getJoinedMeetings,
} from "@/app/api/meeting/meeting";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { HostedMeeting, JoinedMeeting } from "@/app/type/meeting/Meeting";

export default function MeetingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("Meeting");

  const [activeTab, setActiveTab] = useState<"hosted" | "joined">("hosted");
  const [hostedMeetings, setHostedMeetings] = useState<HostedMeeting[]>([]);
  const [joinedMeetings, setJoinedMeetings] = useState<JoinedMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      if (status !== "authenticated") return;

      setIsLoading(true);
      setError("");

      try {
        const hostedData = await getHostedMeetings();
        setHostedMeetings(hostedData || []);

        const joinedData = await getJoinedMeetings();
        setJoinedMeetings(joinedData || []);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError(t("error.fetch_meetings"));
        toast.error(t("error.fetch_meetings"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [status, t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/${locale}/meeting/${meetingId}`);
  };

  if (status === "loading") {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  return (
    <div className="meetings-list-container">
      <div className="meetings-list-header">
        <h1 className="meetings-list-title">{t("title")}</h1>

        <div className="meetings-actions">
          <Link href={`/${locale}/meeting/join`} className="btn-secondary">
            <FaVideo className="me-2" />
            {t("joinMeeting")}
          </Link>

          <Link href={`/${locale}/meeting/create`} className="btn-primary ms-3">
            <FaPlus className="me-2" />
            {t("createMeeting")}
          </Link>
        </div>
      </div>

      <div className="meetings-tabs">
        <div
          className={`meetings-tab ${activeTab === "hosted" ? "active" : ""}`}
          onClick={() => setActiveTab("hosted")}
        >
          <FaCalendarAlt className="me-2" />
          {t("hostedMeetings")}
        </div>

        <div
          className={`meetings-tab ${activeTab === "joined" ? "active" : ""}`}
          onClick={() => setActiveTab("joined")}
        >
          <FaHistory className="me-2" />
          {t("joinedMeetings")}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="meetings-list">
          {activeTab === "hosted" && (
            <>
              {hostedMeetings.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  {t("noHostedMeetings")}
                </div>
              ) : (
                hostedMeetings.map((meeting) => (
                  <div key={meeting.id} className="meeting-card">
                    <div className="meeting-card-info">
                      <div className="meeting-card-title">{meeting.title}</div>
                      <div className="meeting-card-details">
                        <span>
                          <FaCalendarAlt className="me-1" />
                          {formatDate(meeting.startTime)}
                        </span>
                        <span>
                          {t("participants")}: {meeting.participantCount || 0}
                        </span>
                        <span>
                          {t("code")}: {meeting.meetingCode}
                        </span>
                      </div>
                    </div>

                    <div className="meeting-card-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleJoinMeeting(meeting.id)}
                      >
                        {meeting.isActive ? t("joinNow") : t("view")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "joined" && (
            <>
              {joinedMeetings.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  {t("noJoinedMeetings")}
                </div>
              ) : (
                joinedMeetings.map((meeting) => (
                  <div key={meeting.id} className="meeting-card">
                    <div className="meeting-card-info">
                      <div className="meeting-card-title">{meeting.title}</div>
                      <div className="meeting-card-details">
                        <span>
                          <FaCalendarAlt className="me-1" />
                          {formatDate(meeting.startTime)}
                        </span>
                        <span>
                          {t("code")}: {meeting.meetingCode}
                        </span>
                      </div>
                    </div>

                    <div className="meeting-card-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleJoinMeeting(meeting.id)}
                      >
                        {meeting.isActive ? t("joinNow") : t("view")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
