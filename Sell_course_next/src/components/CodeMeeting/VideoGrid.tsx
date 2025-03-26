"use client";

import React, { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { CodeMeetingParticipant } from "@/services/codeMeeting";

interface Props {
  socket: Socket | null;
  participants: CodeMeetingParticipant[];
  localStream: MediaStream | null;
  peerConnections: Map<string, RTCPeerConnection>;
  remoteStreams: Map<string, MediaStream>;
}

const VideoGrid: React.FC<Props> = ({
  socket,
  participants,
  localStream,
  peerConnections,
  remoteStreams,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    console.log(
      "Setting local video stream:",
      localStream ? "Available" : "Not available"
    );
    if (localStream && localVideoRef.current) {
      console.log("Attaching local stream to video element");
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    console.log("Remote streams updated:", Array.from(remoteStreams.keys()));
    remoteStreams.forEach((stream, participantId) => {
      console.log("Processing remote stream for participant:", participantId);
      const videoElement = remoteVideoRefs.current.get(participantId);
      if (videoElement) {
        if (videoElement.srcObject !== stream) {
          console.log(
            "Updating video element with new stream for:",
            participantId
          );
          videoElement.srcObject = stream;
        } else {
          console.log(
            "Video element already has correct stream for:",
            participantId
          );
        }
      } else {
        console.log("No video element found for participant:", participantId);
      }
    });
  }, [remoteStreams]);

  const calculateGridDimensions = (totalParticipants: number) => {
    const aspectRatio = 16 / 9;
    let cols = Math.ceil(Math.sqrt(totalParticipants));
    let rows = Math.ceil(totalParticipants / cols);

    if (cols * aspectRatio > rows) {
      rows = Math.ceil(cols / aspectRatio);
    } else {
      cols = Math.ceil(rows * aspectRatio);
    }

    return { rows, cols };
  };

  const totalParticipants = participants.length + 1; // Including local participant
  const { rows, cols } = calculateGridDimensions(totalParticipants);
  const gridTemplateColumns = `repeat(${cols}, 1fr)`;
  const gridTemplateRows = `repeat(${rows}, 1fr)`;

  return (
    <div
      className="video-grid w-100 h-100"
      style={{
        display: "grid",
        gridTemplateColumns,
        gridTemplateRows,
        gap: "10px",
        padding: "10px",
        backgroundColor: "#1a1a1a",
      }}
    >
      <div className="video-container position-relative">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-100 h-100 rounded"
          style={{ objectFit: "cover" }}
        />
        <div className="position-absolute bottom-0 start-0 p-2 text-white bg-dark bg-opacity-50 rounded-bottom">
          You (Local)
        </div>
      </div>

      {participants.map((participant) => (
        <div
          key={participant.socketId}
          className="video-container position-relative"
        >
          <video
            ref={(el) => {
              if (el) {
                remoteVideoRefs.current.set(participant.socketId, el);
              } else {
                remoteVideoRefs.current.delete(participant.socketId);
              }
            }}
            autoPlay
            playsInline
            className="w-100 h-100 rounded"
            style={{ objectFit: "cover" }}
          />
          <div className="position-absolute bottom-0 start-0 p-2 text-white bg-dark bg-opacity-50 rounded-bottom">
            {participant.username}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
