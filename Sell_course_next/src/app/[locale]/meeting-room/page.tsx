"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import CodeMeetingRoom from "@/components/CodeMeeting/CodeMeetingRoom";

export default function MeetingRoomPage() {
  const t = useTranslations();
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [showMeeting, setShowMeeting] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    router.push(`/en/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId) {
      router.push(`/en/room/${roomId}`);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 p-4">
      <h2 className="mb-4 text-center">Code Meeting Room</h2>
      <div className="card w-100" style={{ maxWidth: "400px" }}>
        <div className="card-body">
          <div className="mb-4">
            <button
              className="btn btn-primary btn-lg w-100"
              onClick={handleCreateRoom}
            >
              Create New Room
            </button>
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg mb-3"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button
              className="btn btn-success btn-lg w-100"
              onClick={handleJoinRoom}
              disabled={!roomId}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
