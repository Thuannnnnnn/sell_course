"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaCopy, FaUsers, FaCommentAlt } from "react-icons/fa";
import {
  getMeeting,
  leaveMeeting,
  endMeeting,
  getMeetingMessages,
} from "@/app/api/meeting/meeting";
import useMeetingSocket from "@/hook/useMeetingSocket";
import ParticipantVideo from "@/components/meeting/ParticipantVideo";
import MeetingControls from "@/components/meeting/MeetingControls";
import MeetingChat from "@/components/meeting/MeetingChat";
import ParticipantsList from "@/components/meeting/ParticipantsList";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

enum SidebarView {
  NONE,
  CHAT,
  PARTICIPANTS,
}

export default function MeetingRoom() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;
  const locale = params.locale as string;
  const t = useTranslations("Meeting");

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarView, setSidebarView] = useState<SidebarView>(SidebarView.NONE);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const {
    localStream,
    remoteStreams,
    participants,
    messages,
    isConnecting,
    error: socketError,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    raiseHand,
    lowerHand,
  } = useMeetingSocket(meetingId, session?.user?.user_id || "");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.user_id) {
      fetchMeetingDetails();
    } else if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login`);
    }
  }, [status, session, meetingId, router]);

  const fetchMeetingDetails = async () => {
    setLoading(true);
    try {
      const response = await getMeeting(meetingId);
      if (response.success) {
        setMeeting(response.data);
      } else {
        setError("Failed to load meeting details");
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
      setError("An error occurred while loading the meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveMeeting = async () => {
    const userId = session?.user?.user_id;
    if (!userId) return;

    try {
      await leaveMeeting(meetingId, userId);
      router.push(`/${locale}/meeting`);
    } catch (error) {
      console.error("Error leaving meeting:", error);
    }
  };

  const handleEndMeeting = async () => {
    const userId = session?.user?.user_id;
    if (!userId || !meeting) return;

    if (meeting.hostId !== userId) return;

    try {
      await endMeeting(meetingId, userId);
      router.push(`/${locale}/meeting`);
    } catch (error) {
      console.error("Error ending meeting:", error);
    }
  };

  const handleToggleChat = () => {
    setSidebarView((prev) =>
      prev === SidebarView.CHAT ? SidebarView.NONE : SidebarView.CHAT
    );
  };

  const handleToggleParticipants = () => {
    setSidebarView((prev) =>
      prev === SidebarView.PARTICIPANTS
        ? SidebarView.NONE
        : SidebarView.PARTICIPANTS
    );
  };

  const handleRaiseHand = () => {
    setIsHandRaised(true);
    raiseHand();
  };

  const handleLowerHand = () => {
    setIsHandRaised(false);
    lowerHand();
  };

  const copyMeetingCode = () => {
    if (meeting?.meetingCode) {
      navigator.clipboard.writeText(meeting.meetingCode);
      alert("Meeting code copied to clipboard!");
    }
  };

  const getGridClass = () => {
    const activeParticipantsCount = participants.filter(
      (p) => p.isActive
    ).length;

    if (activeParticipantsCount <= 1) {
      return "one-participant";
    } else if (activeParticipantsCount === 2) {
      return "two-participants";
    } else {
      return "many-participants";
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-5">Loading meeting...</div>;
  }

  if (error || socketError) {
    return (
      <div className="alert alert-danger m-5" role="alert">
        {error || socketError}
      </div>
    );
  }

  if (!meeting) {
    return <div className="text-center py-5">Meeting not found</div>;
  }

  const isHost = session?.user?.user_id === meeting.hostId;
  const currentParticipant = participants.find(
    (p) => p.userId === session?.user?.user_id
  );
  const hasCamera = currentParticipant?.hasCamera || false;
  const hasMicrophone = currentParticipant?.hasMicrophone || false;
  const isScreenSharing = currentParticipant?.isScreenSharing || false;

  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <h1 className="meeting-title">{meeting.title}</h1>
        <div className="meeting-info">
          <div className="meeting-code">
            Code: {meeting.meetingCode}
            <button className="copy-btn" onClick={copyMeetingCode}>
              <FaCopy />
            </button>
          </div>
          <div className="meeting-time">
            Started: {format(new Date(meeting.startTime), "HH:mm")}
          </div>
          <button className="btn-secondary" onClick={handleToggleParticipants}>
            <FaUsers /> {participants.filter((p) => p.isActive).length}
          </button>
        </div>
      </div>

      <div className="meeting-main">
        <div className="video-container">
          <div className={`videos-grid ${getGridClass()}`}>
            <ParticipantVideo
              stream={localStream}
              displayName={session?.user?.name || "You"}
              isActive={true}
              hasCamera={hasCamera}
              hasMicrophone={hasMicrophone}
              isScreenSharing={isScreenSharing}
              isLocal={true}
            />

            {participants
              .filter((p) => p.userId !== session?.user?.user_id && p.isActive)
              .map((participant) => (
                <ParticipantVideo
                  key={participant.userId}
                  stream={remoteStreams.get(participant.userId) || null}
                  displayName={participant.user?.name || "Participant"}
                  isActive={participant.isActive}
                  hasCamera={participant.hasCamera}
                  hasMicrophone={participant.hasMicrophone}
                  isScreenSharing={participant.isScreenSharing}
                />
              ))}
          </div>

          <div className="meeting-controls-container">
            <MeetingControls
              hasCamera={hasCamera}
              hasMicrophone={hasMicrophone}
              isScreenSharing={isScreenSharing}
              isHost={isHost}
              toggleCamera={toggleCamera}
              toggleMicrophone={toggleMicrophone}
              startScreenShare={startScreenShare}
              stopScreenShare={stopScreenShare}
              leaveMeeting={handleLeaveMeeting}
              endMeeting={isHost ? handleEndMeeting : undefined}
              toggleChat={handleToggleChat}
              raiseHand={handleRaiseHand}
              lowerHand={handleLowerHand}
              isHandRaised={isHandRaised}
            />
          </div>
        </div>

        {sidebarView !== SidebarView.NONE && (
          <div className="sidebar">
            {sidebarView === SidebarView.CHAT && (
              <MeetingChat
                messages={messages}
                sendMessage={sendMessage}
                participants={participants}
                currentUserId={session?.user?.user_id || ""}
                onClose={() => setSidebarView(SidebarView.NONE)}
              />
            )}

            {sidebarView === SidebarView.PARTICIPANTS && (
              <ParticipantsList
                participants={participants}
                currentUserId={session?.user?.user_id || ""}
                onClose={() => setSidebarView(SidebarView.NONE)}
              />
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .meeting-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #000;
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #1a1a1a;
          color: white;
        }

        .meeting-title {
          font-size: 1.5rem;
          margin: 0;
        }

        .meeting-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .meeting-code {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .copy-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .meeting-time {
          font-size: 0.9rem;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background-color: #333;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .meeting-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .video-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #000;
          padding: 20px;
        }

        .videos-grid {
          flex: 1;
          width: 100%;
          display: grid;
          gap: 10px;
          overflow: auto;
        }

        .videos-grid.one-participant {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .videos-grid.two-participants {
          grid-template-columns: repeat(2, 1fr);
        }

        .videos-grid.many-participants {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .meeting-controls-container {
          margin-top: 20px;
        }

        .sidebar {
          width: 300px;
          background-color: #1a1a1a;
          color: white;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
