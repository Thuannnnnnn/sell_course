"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  codeMeetingService,
  type CodeMeetingParticipant,
  type CodeMeetingRoom,
} from "@/services/codeMeeting";
import { useSession } from "next-auth/react";
import { Editor } from "@monaco-editor/react";
import VideoGrid from "./VideoGrid";
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsMic,
  BsMicMute,
} from "react-icons/bs";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  roomId?: string;
}

interface ZoomMeeting {
  joinUrl: string;
  meetingId: string;
  password: string;
}

const CodeMeetingRoom: React.FC<Props> = ({ roomId }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<CodeMeetingRoom | null>(null);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [mediaStatus, setMediaStatus] = useState<{
    video: boolean;
    audio: boolean;
  }>({
    video: false,
    audio: false,
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [zoomMeeting, setZoomMeeting] = useState<ZoomMeeting | null>(null);

  // Request media permissions
  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStatus({ video: true, audio: true });
      setLocalStream(stream);
      console.log("Media permissions granted");
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setMediaStatus({ video: false, audio: false });
      setError(
        "Please allow access to camera and microphone to join the meeting"
      );
    }
  };

  // Create a Zoom meeting
  const createZoomMeeting = async (token: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/zoom/create-meeting`,
        {
          topic: "Code Meeting",
          type: 2,
          start_time: new Date().toISOString(),
          duration: 60,
          timezone: "America/Los_Angeles",
          password: "123456",
          agenda: "Collaborative coding session",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { joinUrl, meetingId, password } = response.data.data;
      setZoomMeeting({ joinUrl, meetingId, password });
      console.log("Zoom meeting created:", { joinUrl, meetingId });
    } catch (err) {
      console.error("Error creating Zoom meeting:", err);
      setError("Failed to create Zoom meeting");
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      path: "/socket.io/",
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully");
      console.log("Socket ID:", socketInstance.id);
      setIsConnecting(false);
      setError("");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnecting(true);
      setError("Unable to connect to server. Retrying...");
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason);
      setIsConnecting(true);
      setError("Connection lost. Attempting to reconnect...");
    });

    socketInstance.on(
      "participantJoined",
      (data: {
        newParticipant: CodeMeetingParticipant;
        participants: CodeMeetingParticipant[];
        currentCode: string;
      }) => {
        console.log("New participant joined:", data.newParticipant);
        setRoom((prev) =>
          prev ? { ...prev, participants: data.participants } : null
        );
        setCode(data.currentCode);
      }
    );

    socketInstance.on(
      "participantLeft",
      (data: {
        socketId: string;
        remainingParticipants: CodeMeetingParticipant[];
      }) => {
        console.log("Participant left:", data.socketId);
        setRoom((prev) =>
          prev ? { ...prev, participants: data.remainingParticipants } : null
        );
        if (peerConnections.has(data.socketId)) {
          peerConnections.get(data.socketId)?.close();
          peerConnections.delete(data.socketId);
          remoteStreams.delete(data.socketId);
        }
      }
    );

    socketInstance.on("codeUpdated", (data: { code: string }) => {
      console.log("Code updated:", data.code.substring(0, 100) + "...");
      setCode(data.code);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Initialize room and media
  useEffect(() => {
    const initializeRoom = async () => {
      if (status === "unauthenticated") {
        router.push("/auth/signin");
        return;
      }

      if (status === "loading" || !session?.user?.token) {
        console.log("Session loading or token missing");
        return;
      }

      const userId = session?.user?.user_id;
      const username = session?.user?.username;
      const token = session?.user?.token;

      console.log("User session data:", { userId, username, token });

      if (!userId || !username || !token) {
        console.log("Missing user session data or token");
        setError("Authentication data missing");
        setIsLoading(false);
        return;
      }

      try {
        await requestMediaPermissions();

        let currentRoom: CodeMeetingRoom | null = null;

        if (roomId) {
          console.log("Joining existing room:", roomId);
          try {
            currentRoom = await codeMeetingService.joinRoom(
              roomId,
              userId,
              username,
              token
            );
            console.log("Joined room successfully:", currentRoom);
          } catch (joinErr: any) {
            console.error(
              "Failed to join room:",
              joinErr.response?.data || joinErr.message
            );
            if (joinErr.response?.status === 404) {
              console.log("Room not found, creating a new one");
              currentRoom = await codeMeetingService.createRoom(
                userId,
                username,
                token
              );
              console.log("Created new room:", currentRoom);
            } else {
              throw joinErr; // Re-throw other errors
            }
          }
          if (socket?.connected) {
            socket.emit("joinRoom", {
              roomId: currentRoom.roomId,
              userId,
              username,
            });
          }
        } else {
          console.log("Creating new room");
          currentRoom = await codeMeetingService.createRoom(
            userId,
            username,
            token
          );
          console.log("Created room successfully:", currentRoom);
          if (socket?.connected) {
            socket.emit("createRoom", { userId, username });
          }
          await createZoomMeeting(token);
        }

        setRoom(currentRoom);
        setCode(currentRoom.code || "");
      } catch (err: any) {
        console.error(
          "Room initialization error:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to initialize room");
      } finally {
        setIsLoading(false);
      }
    };

    initializeRoom();
  }, [socket?.connected, session, roomId]);

  // WebRTC peer connections (unchanged for brevity, but added logging)
  useEffect(() => {
    if (
      !session?.user?.user_id ||
      !session?.user?.username ||
      !socket ||
      !localStream ||
      !room
    ) {
      console.log("Missing dependencies for WebRTC:", {
        session,
        socket,
        localStream,
        room,
      });
      return;
    }

    const createPeerConnection = (socketId: string) => {
      console.log("Creating peer connection for:", socketId);
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to:", socketId);
          socket.emit("ice-candidate", {
            to: socketId,
            candidate: event.candidate,
          });
        }
      };
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream from:", socketId);
        remoteStreams.set(socketId, event.streams[0]);
      };
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));
      return peerConnection;
    };

    socket.on(
      "offer",
      async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
        const peerConnection = createPeerConnection(data.from);
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { to: data.from, answer });
        peerConnections.set(data.from, peerConnection);
      }
    );

    socket.on(
      "answer",
      async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        const peerConnection = peerConnections.get(data.from);
        if (peerConnection)
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
      }
    );

    socket.on(
      "ice-candidate",
      async (data: { from: string; candidate: RTCIceCandidateInit }) => {
        const peerConnection = peerConnections.get(data.from);
        if (peerConnection)
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
      }
    );

    room.participants.forEach((participant) => {
      if (
        participant.socketId &&
        participant.socketId !== socket.id &&
        !peerConnections.has(participant.socketId)
      ) {
        const peerConnection = createPeerConnection(participant.socketId);
        peerConnection
          .createOffer()
          .then((offer) => peerConnection.setLocalDescription(offer))
          .then(() => {
            socket.emit("offer", {
              to: participant.socketId,
              offer: peerConnection.localDescription,
            });
            peerConnections.set(participant.socketId, peerConnection);
          });
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      peerConnections.forEach((connection) => connection.close());
      peerConnections.clear();
      remoteStreams.clear();
    };
  }, [socket, localStream, room, peerConnections, remoteStreams, session]);

  const handleCodeChange = (value: string | undefined) => {
    if (!value || !room) return;
    setCode(value);
    socket?.emit("codeUpdate", { roomId: room.roomId, code: value });
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setMediaStatus((prev) => ({ ...prev, video: videoTrack.enabled }));
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMediaStatus((prev) => ({ ...prev, audio: audioTrack.enabled }));
    }
  };

  if (status === "loading" || isLoading || isConnecting) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div>
          {isConnecting ? "Connecting to server..." : "Loading room..."}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
        {error.includes("camera") && (
          <button
            className="btn btn-primary mt-2"
            onClick={requestMediaPermissions}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!room) {
    return <div>Waiting for room initialization...</div>;
  }

  return (
    <div className="container-fluid vh-100 d-flex p-0">
      {socket && mediaStatus.video && mediaStatus.audio ? (
        <>
          <div className="col-3 p-4 bg-light">
            <h2 className="h4 mb-4">Participants</h2>
            <div className="list-group mb-4">
              {room.participants.map((participant) => (
                <div
                  key={participant.socketId || participant.userId}
                  className="list-group-item"
                >
                  {participant.username}
                </div>
              ))}
            </div>
            {zoomMeeting && (
              <div className="mb-4">
                <h3 className="h5">Zoom Meeting</h3>
                <p>
                  <a
                    href={zoomMeeting.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                  >
                    Join Zoom Meeting
                  </a>
                </p>
                <p>Meeting ID: {zoomMeeting.meetingId}</p>
                <p>Password: {zoomMeeting.password}</p>
              </div>
            )}
            <div className="d-flex justify-content-center gap-3">
              <button
                className={`btn ${
                  mediaStatus.video ? "btn-primary" : "btn-secondary"
                }`}
                onClick={toggleVideo}
              >
                {mediaStatus.video ? <BsCameraVideo /> : <BsCameraVideoOff />}
              </button>
              <button
                className={`btn ${
                  mediaStatus.audio ? "btn-primary" : "btn-secondary"
                }`}
                onClick={toggleAudio}
              >
                {mediaStatus.audio ? <BsMic /> : <BsMicMute />}
              </button>
            </div>
          </div>
          <div className="col-9 p-4">
            <Editor
              height="50vh"
              defaultLanguage="javascript"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
            <div className="mt-4" style={{ height: "35vh" }}>
              <VideoGrid
                socket={socket}
                participants={room.participants}
                localStream={localStream}
                peerConnections={peerConnections}
                remoteStreams={remoteStreams}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <p className="text-danger mb-4">
              {error || "Requesting camera and microphone access..."}
            </p>
            {!mediaStatus.video && !mediaStatus.audio && (
              <button
                className="btn btn-primary"
                onClick={requestMediaPermissions}
              >
                Grant Permissions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeMeetingRoom;
