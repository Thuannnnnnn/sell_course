"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  FaUsers,
  FaSignOutAlt,
  FaCopy,
} from "react-icons/fa";
import { useMediaStream } from "@/hook/useMediaStream";
import { useMeetingSocket } from "@/hook/useMeetingSocket";
import {
  getMeetingParticipants,
  updateParticipantStatus,
  leaveMeeting,
  getMeetingById,
} from "@/app/api/meeting/meeting";
import { toast } from "react-hot-toast";

const MeetingRoom = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;
  const locale = params.locale as string;
  const t = useTranslations("Meeting");

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<{
    title: string;
    meetingCode: string;
    startTime: string;
  } | null>(null);

  const {
    stream: localStream,
    error: mediaError,
    isLoading: isMediaLoading,
    hasCamera,
    hasMicrophone,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    stopStream,
  } = useMediaStream({ audio: true, video: true });

  const {
    error: socketError,
    participants,
    participantStreams,
    leaveMeeting: leaveSocketMeeting,
  } = useMeetingSocket({
    meetingId,
    userId: session?.user?.user_id || "",
    localStream,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const meetingData = await getMeetingById(meetingId);
        setMeetingInfo({
          title: meetingData.title,
          meetingCode: meetingData.meetingCode,
          startTime: meetingData.startTime,
        });
        await getMeetingParticipants(meetingId);
      } catch (error) {
        console.error("Error fetching meeting info:", error);
        toast.error(t("meetingNotFound"));
      }
    };

    if (session?.user?.user_id) {
      fetchMeetingInfo();
    }
  }, [meetingId, session?.user?.user_id, t]);

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      setIsScreenSharing(false);
      await updateParticipantStatus({
        meetingId,
        hasCamera,
        hasMicrophone,
        isScreenSharing: false,
      });
    } else {
      const screenStream = await startScreenShare();
      if (screenStream) {
        setIsScreenSharing(true);
        await updateParticipantStatus({
          meetingId,
          hasCamera,
          hasMicrophone,
          isScreenSharing: true,
        });
      }
    }
  };

  const handleToggleCamera = async () => {
    const newState = !hasCamera;
    toggleCamera(newState);
    await updateParticipantStatus({
      meetingId,
      hasCamera: newState,
      hasMicrophone,
      isScreenSharing,
    });
  };

  const handleToggleMicrophone = async () => {
    try {
      const newState = !hasMicrophone;
      toggleMicrophone(newState);
      await updateParticipantStatus({
        meetingId,
        hasCamera,
        hasMicrophone: newState,
        isScreenSharing,
      });
    } catch (error) {
      console.error("Failed to update microphone status:", error);
      toast.error(t("meetingNotFound"));
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      await leaveMeeting(meetingId);
      leaveSocketMeeting();
      stopStream();
      router.push(`/${locale}/meeting`);
    } catch (error) {
      console.error("Error leaving meeting:", error);
      toast.error(t("leaveMeeting"));
    }
  };

  const copyMeetingCode = () => {
    if (meetingInfo?.meetingCode) {
      navigator.clipboard.writeText(meetingInfo.meetingCode);
      toast.success(t("code"));
    }
  };

  if (status === "loading" || isMediaLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">{t("loading")}</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  if (mediaError || socketError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <div className="text-red-500 text-xl mb-4">
          {mediaError || socketError}
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => router.push(`/${locale}/meeting`)}
        >
          {t("cancel")}
        </button>
      </div>
    );
  }

  const getGridClass = () => {
    const totalParticipants = participantStreams.length + 1;
    if (totalParticipants === 1) return "one-participant";
    if (totalParticipants === 2) return "two-participants";
    return "many-participants";
  };

  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <h1 className="meeting-title">
          {meetingInfo?.title || t("meetingNotFound")}
        </h1>
        <div className="meeting-info">
          <div className="meeting-code">
            {t("meetingCode")}: {meetingInfo?.meetingCode}{" "}
            <button className="copy-btn" onClick={copyMeetingCode}>
              <FaCopy />
            </button>
          </div>
          <div className="meeting-time">
            {meetingInfo?.startTime &&
              new Date(meetingInfo.startTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className={`meeting-content ${getGridClass()}`}>
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="local-video-controls">
            <button
              className={`control-btn ${hasCamera ? "active" : ""}`}
              onClick={handleToggleCamera}
              title={hasCamera ? t("cameraOn") : t("cameraOff")}
            >
              {hasCamera ? <FaVideo /> : <FaVideoSlash />}
            </button>
            <button
              className={`control-btn ${hasMicrophone ? "active" : ""}`}
              onClick={handleToggleMicrophone}
              title={hasMicrophone ? t("microphoneOn") : t("microphoneOff")}
            >
              {hasMicrophone ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button
              className={`control-btn ${isScreenSharing ? "active" : ""}`}
              onClick={handleToggleScreenShare}
              title={t("recordMeeting")}
            >
              <FaDesktop />
            </button>
            <button
              className="control-btn participants-btn"
              onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
              title={t("participants")}
            >
              <FaUsers />
            </button>
            <button 
              className="control-btn leave-btn" 
              onClick={handleLeaveMeeting}
              title={t("leaveMeeting")}
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {participantStreams.map((stream) => (
          <div key={stream.userId} className="participant-video-container">
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) video.srcObject = stream.stream;
              }}
              className="participant-video"
            />
          </div>
        ))}
      </div>

      {isParticipantsOpen && (
        <div className="participants-panel">
          <h3>{t("participants")}</h3>
          <div className="participants-list">
            {participants.length === 0 ? (
              <div className="no-participants">{t("noParticipants")}</div>
            ) : (
              participants.map((participant) => (
                <div key={participant.userId} className="participant-item">
                  <div className="participant-avatar">
                    {participant.user?.username?.[0] || "?"}
                  </div>
                  <div className="participant-info">
                    <div className="participant-name">
                      {participant.user?.username || t("noParticipants")}
                      {participant.role === "host" && (
                        <span className="host-badge">{t("host")}</span>
                      )}
                    </div>
                    <div className="participant-status">
                      {participant.hasCamera && (
                        <span className="status-icon active" title={t("cameraOn")}>
                          <FaVideo />
                        </span>
                      )}
                      {participant.hasMicrophone && (
                        <span className="status-icon active" title={t("microphoneOn")}>
                          <FaMicrophone />
                        </span>
                      )}
                      {participant.isScreenSharing && (
                        <span className="status-icon active" title={t("recordMeeting")}>
                          <FaDesktop />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
