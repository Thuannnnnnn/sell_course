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
import { MeetingParticipant } from "@/app/api/meeting/meeting";

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

  const [meetingDetails, setMeetingDetails] = useState<{
    id: string;
    hostId: string;
    title: string;
    meetingCode: string;
    startTime: string;
    isHost?: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const meetingData = await getMeetingById(meetingId);
        setMeetingInfo({
          title: meetingData.title,
          meetingCode: meetingData.meetingCode,
          startTime: meetingData.startTime,
        });
        setMeetingDetails({
          id: meetingData.id,
          hostId: meetingData.hostId,
          title: meetingData.title,
          meetingCode: meetingData.meetingCode,
          startTime: meetingData.startTime,
          isHost: meetingData.isHost,
        });
        await getMeetingParticipants(meetingId);
      } catch (error) {
        console.error("Error fetching meeting info:", error);
        toast.error("Error fetching meeting information");
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
      toast.error(t("error.update_status"));
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
      toast.error(t("error.leave_meeting"));
    }
  };

  const copyMeetingCode = () => {
    if (meetingInfo?.meetingCode) {
      navigator.clipboard.writeText(meetingInfo.meetingCode);
      toast.success(t("meeting_room.code_copied"));
    }
  };

  if (status === "loading" || isMediaLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
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
          {t("meeting_room.back_to_meetings")}
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
          {meetingInfo?.title || t("meeting_room.untitled")}
        </h1>
        <div className="meeting-info">
          <div className="meeting-code">
            {t("meeting_room.code")}: {meetingInfo?.meetingCode}{" "}
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

      <div className="meeting-main">
        <div className="video-container">
          <div className={`videos-grid ${getGridClass()}`}>
            <div className="video-item">
              <div className="video-wrapper">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`video-element ${!hasCamera ? "hidden" : ""}`}
                />
                {!hasCamera && (
                  <div className="video-placeholder">
                    <div className="user-initial">
                      {session?.user?.name?.[0] || "U"}
                    </div>
                    <div className="user-name">
                      {session?.user?.name || t("meeting_room.you")} (
                      {t("meeting_room.you")})
                    </div>
                  </div>
                )}
                <div className="video-overlay">
                  <div className="participant-name">
                    {session?.user?.name || t("meeting_room.you")} (
                    {t("meeting_room.you")})
                  </div>
                  <div className="participant-controls">
                    {!hasMicrophone && (
                      <FaMicrophoneSlash className="control-icon muted" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {participantStreams.map((participant) => (
              <div key={participant.userId} className="video-item">
                <div className="video-wrapper">
                  <RemoteVideo
                    stream={participant.stream}
                    hasCamera={participant.hasCamera}
                    userId={participant.userId}
                    participants={participants}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {isParticipantsOpen && (
          <div className="sidebar">
            <ParticipantsPanel participants={participants} />
          </div>
        )}
      </div>

      <div className="meeting-controls-container">
        <div className="meeting-controls">
          <button
            className={`control-btn ${hasCamera ? "" : "disabled"}`}
            onClick={handleToggleCamera}
          >
            {hasCamera ? <FaVideo /> : <FaVideoSlash />}
            <span>
              {hasCamera
                ? t("meeting_room.camera_on")
                : t("meeting_room.camera_off")}
            </span>
          </button>
          <button
            className={`control-btn ${hasMicrophone ? "" : "disabled"}`}
            onClick={handleToggleMicrophone}
          >
            {hasMicrophone ? <FaMicrophone /> : <FaMicrophoneSlash />}
            <span>
              {hasMicrophone
                ? t("meeting_room.mic_on")
                : t("meeting_room.mic_off")}
            </span>
          </button>
          <button
            className={`control-btn ${isScreenSharing ? "active" : ""}`}
            onClick={handleToggleScreenShare}
          >
            <FaDesktop />
            <span>{t("meeting_room.share_screen")}</span>
          </button>
          <button
            className={`control-btn ${isParticipantsOpen ? "active" : ""}`}
            onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
          >
            <FaUsers />
            <span>{t("meeting_room.participants")}</span>
          </button>
          <button
            className="control-btn leave-btn"
            onClick={handleLeaveMeeting}
          >
            <FaSignOutAlt />
            <span>{t("meeting_room.leave")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface RemoteVideoProps {
  stream: MediaStream;
  hasCamera: boolean;
  userId: string;
  participants: MeetingParticipant[];
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({
  stream,
  hasCamera,
  userId,
  participants,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const participant = participants.find((p) => p.userId === userId);
  const isHost = participant?.role === "host";

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`video-element ${!hasCamera ? "hidden" : ""}`}
      />
      {!hasCamera && (
        <div className="video-placeholder">
          <div className="user-initial">
            {participant?.user?.username?.[0] || "U"}
          </div>
          <div className="user-name">
            {participant?.user?.username || "User"}
          </div>
        </div>
      )}
      <div className="video-overlay">
        <div className="participant-name">
          {participant?.user?.username || "User"}
          {isHost && <span className="host-badge"> (Host)</span>}
        </div>
        <div className="participant-controls">
          {!participant?.hasMicrophone && (
            <FaMicrophoneSlash className="control-icon muted" />
          )}
        </div>
      </div>
    </>
  );
};

interface ParticipantsPanelProps {
  participants: MeetingParticipant[];
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
}) => {
  const t = useTranslations("Meeting");

  return (
    <div className="participants-panel">
      <div className="participants-header">
        <h3>
          {t("meeting_room.participants")} ({participants.length})
        </h3>
      </div>
      <div className="participants-list">
        {participants.length === 0 ? (
          <div className="no-participants">
            {t("meeting_room.no_participants")}
          </div>
        ) : (
          participants.map((participant) => {
            const isHost = participant.role === "host";
            return (
              <div key={participant.userId} className="participant-item">
                <div className="participant-avatar">
                  {participant?.user?.username?.[0] || "U"}
                </div>
                <div className="participant-info">
                  <div className="participant-name">
                    {participant?.user?.username || "Unknown User"}
                    {isHost && (
                      <span className="host-badge">
                        {t("meeting_room.host")}
                      </span>
                    )}
                  </div>
                  <div className="participant-status">
                    {!participant?.hasMicrophone && (
                      <FaMicrophoneSlash className="status-icon" />
                    )}
                    {!participant?.hasCamera && (
                      <FaVideoSlash className="status-icon" />
                    )}
                    {participant?.isScreenSharing && (
                      <FaDesktop className="status-icon active" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;
