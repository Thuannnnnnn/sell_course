import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { MeetingParticipant } from "@/app/api/meeting/meeting";

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface UseMeetingSocketProps {
  meetingId: string;
  userId: string;
  localStream: MediaStream | null;
}

interface ParticipantStream {
  userId: string;
  stream: MediaStream;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
}

interface UpdateParticipantStatusData {
  meetingId: string;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const useMeetingSocket = ({
  meetingId,
  userId,
  localStream,
}: UseMeetingSocketProps) => {
  const socketRef = useRef<typeof Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [participantStreams, setParticipantStreams] = useState<
    ParticipantStream[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
    try {
      const token = localStorage.getItem("token");
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        query: { meetingId },
        path: "/socket.io",
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        socketRef.current?.emit("joinRoom", { meetingId, userId });
      });

      socketRef.current.on("connect_error", (err: Error) => {
        console.error("Socket connection error:", err.message);
        setError("Failed to connect to the meeting server");
        setIsConnected(false);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on(
        "userJoined",
        async ({ userId: newUserId }: { userId: string }) => {
          if (newUserId !== userId && localStream) {
            await createPeerConnection(newUserId, true);
          }
        }
      );

      socketRef.current.on(
        "userLeft",
        ({ userId: leftUserId }: { userId: string }) => {
          removePeerConnection(leftUserId);
        }
      );

      socketRef.current.on("roomClosed", () => {
        setError("The meeting has been ended by the host");
        cleanup();
      });

      socketRef.current.on(
        "participantsUpdate",
        (updatedParticipants: MeetingParticipant[]) => {
          setParticipants(updatedParticipants);
        }
      );

      socketRef.current.on(
        "offer",
        async ({
          from,
          offer,
        }: {
          from: string;
          offer: RTCSessionDescriptionInit;
        }) => {
          if (from !== userId && localStream) {
            const peerConnection = await createPeerConnection(from, false);
            await peerConnection.connection.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            const answer = await peerConnection.connection.createAnswer();
            await peerConnection.connection.setLocalDescription(answer);
            socketRef.current?.emit("answer", { to: from, answer });
          }
        }
      );

      socketRef.current.on(
        "answer",
        async ({
          from,
          answer,
        }: {
          from: string;
          answer: RTCSessionDescriptionInit;
        }) => {
          const peerConnection = peerConnectionsRef.current.get(from);
          if (peerConnection) {
            await peerConnection.connection.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        }
      );

      socketRef.current.on(
        "iceCandidate",
        async ({
          from,
          candidate,
        }: {
          from: string;
          candidate: RTCIceCandidateInit;
        }) => {
          const peerConnection = peerConnectionsRef.current.get(from);
          if (peerConnection && candidate) {
            await peerConnection.connection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        }
      );

      socketRef.current.emit("getParticipants", { meetingId });

      return () => {
        cleanup();
      };
    } catch (err) {
      console.error("Error setting up socket:", err);
      setError("Failed to initialize meeting connection");
      return () => {};
    }
  }, [meetingId, userId, localStream]);

  useEffect(() => {
    if (localStream && isConnected) {
      peerConnectionsRef.current.forEach((peer) => {
        updatePeerStream(peer, localStream);
      });
    }
  }, [localStream, isConnected]);

  const createPeerConnection = async (
    peerId: string,
    isInitiator: boolean
  ): Promise<PeerConnection> => {
    try {
      if (peerConnectionsRef.current.has(peerId)) {
        return peerConnectionsRef.current.get(peerId)!;
      }

      const peerConnection = new RTCPeerConnection(ICE_SERVERS);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      const peer: PeerConnection = {
        userId: peerId,
        connection: peerConnection,
      };
      peerConnectionsRef.current.set(peerId, peer);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("iceCandidate", {
            to: peerId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === "disconnected" ||
          peerConnection.connectionState === "failed"
        ) {
          removePeerConnection(peerId);
        }
      };

      peerConnection.ontrack = (event) => {
        const stream = event.streams[0];
        const participant = participants.find((p) => p.userId === peerId);

        if (stream && participant) {
          setParticipantStreams((prev) => {
            const filtered = prev.filter((p) => p.userId !== peerId);
            return [
              ...filtered,
              {
                userId: peerId,
                stream,
                hasCamera: participant.hasCamera,
                hasMicrophone: participant.hasMicrophone,
                isScreenSharing: participant.isScreenSharing,
              },
            ];
          });
        }
      };

      if (isInitiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socketRef.current?.emit("offer", { to: peerId, offer });
      }

      return peer;
    } catch (err) {
      console.error("Error creating peer connection:", err);
      setError("Failed to connect to participant");
      throw err;
    }
  };

  const updatePeerStream = (peer: PeerConnection, stream: MediaStream) => {
    const senders = peer.connection.getSenders();
    stream.getTracks().forEach((track) => {
      const sender = senders.find((s) => s.track?.kind === track.kind);
      if (sender) {
        sender.replaceTrack(track);
      } else {
        peer.connection.addTrack(track, stream);
      }
    });
  };

  const removePeerConnection = (peerId: string) => {
    const peer = peerConnectionsRef.current.get(peerId);
    if (peer) {
      peer.connection.close();
      peerConnectionsRef.current.delete(peerId); // Sửa thành peerConnectionsRef
      setParticipantStreams((prev) => prev.filter((p) => p.userId !== peerId));
    }
  };

  const cleanup = () => {
    peerConnectionsRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peerConnectionsRef.current.clear();
    setParticipantStreams([]);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  };

  const toggleCamera = useCallback(
    (enabled: boolean) => {
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = enabled;
        });
        const updateData: UpdateParticipantStatusData = {
          meetingId,
          hasCamera: enabled,
          hasMicrophone: localStream
            .getAudioTracks()
            .some((track) => track.enabled),
          isScreenSharing: false,
        };
        socketRef.current?.emit("updateParticipantStatus", updateData);
      }
    },
    [localStream, meetingId]
  );

  const toggleMicrophone = useCallback(
    (enabled: boolean) => {
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = enabled;
        });
        const updateData: UpdateParticipantStatusData = {
          meetingId,
          hasCamera: localStream
            .getVideoTracks()
            .some((track) => track.enabled),
          hasMicrophone: enabled,
          isScreenSharing: false,
        };
        socketRef.current?.emit("updateParticipantStatus", updateData);
      }
    },
    [localStream, meetingId]
  );

  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      peerConnectionsRef.current.forEach((peer) => {
        const videoTrack = screenStream.getVideoTracks()[0];
        const senders = peer.connection.getSenders();
        const sender = senders.find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      screenStream.getVideoTracks()[0].onended = () => {
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          peerConnectionsRef.current.forEach((peer) => {
            const senders = peer.connection.getSenders();
            const sender = senders.find((s) => s.track?.kind === "video");
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          });
          const updateData: UpdateParticipantStatusData = {
            meetingId,
            hasCamera: true,
            hasMicrophone: localStream
              .getAudioTracks()
              .some((track) => track.enabled),
            isScreenSharing: false,
          };
          socketRef.current?.emit("updateParticipantStatus", updateData);
        }
      };

      const updateData: UpdateParticipantStatusData = {
        meetingId,
        hasCamera: true,
        hasMicrophone: localStream
          ? localStream.getAudioTracks().some((track) => track.enabled)
          : false,
        isScreenSharing: true,
      };
      socketRef.current?.emit("updateParticipantStatus", updateData);

      return screenStream;
    } catch (err) {
      console.error("Error sharing screen:", err);
      throw err;
    }
  }, [localStream, meetingId]);

  const leaveMeeting = useCallback(() => {
    const isHost = participants.some(
      (p) => p.userId === userId && p.role === "host"
    );
    socketRef.current?.emit("leaveRoom", { meetingId, userId });
    cleanup();
  }, [meetingId, userId, participants]);

  return {
    isConnected,
    error,
    participants,
    participantStreams,
    toggleCamera,
    toggleMicrophone,
    shareScreen,
    leaveMeeting,
  };
};
