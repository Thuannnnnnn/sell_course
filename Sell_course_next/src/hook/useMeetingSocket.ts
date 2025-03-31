"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import io, { Socket } from "socket.io-client";
import { MeetingParticipant } from "../app/api/meeting/meeting"; // Chỉ giữ lại MeetingParticipant

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type SocketType = typeof Socket;

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface UseMeetingSocketResult {
  socket: typeof Socket | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: MeetingParticipant[];
  isConnecting: boolean;
  error: string | null;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  sendMessage: (
    message: string,
    isPrivate?: boolean,
    receiverId?: string
  ) => void;
  raiseHand: () => void;
  lowerHand: () => void;
}

const useMeetingSocket = (
  meetingId: string,
  userId: string
): UseMeetingSocketResult => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [hasMicrophone, setHasMicrophone] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
  const screenShareStream = useRef<MediaStream | null>(null);

  const iceServers = useMemo(
    () => ({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    }),
    []
  );

  const checkDevices = useCallback(async (): Promise<{
    hasVideo: boolean;
    hasAudio: boolean;
  }> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((device) => device.kind === "videoinput");
      const hasAudio = devices.some((device) => device.kind === "audioinput");
      return { hasVideo, hasAudio };
    } catch (err) {
      console.error("Unable to enumerate devices:", err);
      return { hasVideo: false, hasAudio: false };
    }
  }, []);

  const renegotiatePeerConnection = useCallback(
    async (participantId: string, connection: RTCPeerConnection) => {
      try {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        socket?.emit("offer", {
          to: participantId,
          offer: connection.localDescription,
        });
      } catch (err) {
        console.error("Error renegotiating peer connection:", err);
      }
    },
    [socket]
  );

  const initializeStream = useCallback(
    async (
      constraints: MediaStreamConstraints
    ): Promise<MediaStream | null> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Stream initialized successfully:", stream);
        setLocalStream(stream);

        peerConnections.current.forEach((peer) => {
          stream.getTracks().forEach((track) => {
            peer.connection.addTrack(track, stream);
          });
          renegotiatePeerConnection(peer.userId, peer.connection);
        });

        return stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Failed to access media devices. Please check permissions.");
        return null;
      }
    },
    [renegotiatePeerConnection]
  );

  // Moved createPeerConnection, handleOffer, handleAnswer, and handleIceCandidate before useEffect
  const createPeerConnection = useCallback(
    (participantId: string, socket: SocketType): PeerConnection => {
      const connection = new RTCPeerConnection(iceServers);
      const peerConnection: PeerConnection = {
        userId: participantId,
        connection,
      };

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.enabled) {
            console.log(`Adding track to peer ${participantId}:`, track);
            connection.addTrack(track, localStream);
          }
        });
      }

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: participantId,
            candidate: event.candidate,
          });
        }
      };

      connection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        console.log(
          `Received remote stream from ${participantId}:`,
          remoteStream
        );
        setRemoteStreams((prev) =>
          new Map(prev).set(participantId, remoteStream)
        );
        peerConnection.stream = remoteStream;
      };

      if (userId < participantId) {
        connection
          .createOffer()
          .then((offer) => connection.setLocalDescription(offer))
          .then(() =>
            socket.emit("offer", {
              to: participantId,
              offer: connection.localDescription,
            })
          )
          .catch((err) => console.error("Error creating offer:", err));
      }

      peerConnections.current.set(participantId, peerConnection);
      return peerConnection;
    },
    [localStream, userId, iceServers]
  );

  const handleOffer = useCallback(
    async (
      from: string,
      offer: RTCSessionDescriptionInit,
      socket: SocketType
    ): Promise<void> => {
      let peerConnection = peerConnections.current.get(from);
      if (!peerConnection) {
        peerConnection = createPeerConnection(from, socket);
      }

      await peerConnection.connection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.connection.createAnswer();
      await peerConnection.connection.setLocalDescription(answer);
      socket.emit("answer", {
        to: from,
        answer: peerConnection.connection.localDescription,
      });
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(
    async (from: string, answer: RTCSessionDescriptionInit): Promise<void> => {
      const peerConnection = peerConnections.current.get(from);
      if (peerConnection) {
        await peerConnection.connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    },
    []
  );

  const handleIceCandidate = useCallback(
    async (from: string, candidate: RTCIceCandidateInit): Promise<void> => {
      const peerConnection = peerConnections.current.get(from);
      if (peerConnection && peerConnection.connection.remoteDescription) {
        await peerConnection.connection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    },
    []
  );

  useEffect(() => {
    if (!meetingId || !userId) return;

    const newSocket = io(`${API_URL}/meetings`, {
      query: { meetingId, userId },
    }) as typeof Socket;

    setSocket(newSocket);

    newSocket.emit("join-meeting", { meetingId, userId });
    newSocket.emit("update-status", {
      meetingId,
      userId,
      hasCamera: false,
      hasMicrophone: false,
      isScreenSharing: false,
    });
    setIsConnecting(false);

    newSocket.on("connect", () => {
      console.log("Connected to meeting socket server");
    });

    newSocket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err);
      setError("Failed to connect to the meeting server.");
    });

    newSocket.on(
      "current-participants",
      (currentParticipants: MeetingParticipant[]) => {
        console.log("Received current participants:", currentParticipants);
        setParticipants(currentParticipants);
        currentParticipants.forEach((participant) => {
          if (participant.userId !== userId && participant.isActive) {
            createPeerConnection(participant.userId, newSocket);
          }
        });
      }
    );

    newSocket.on(
      "participant-joined",
      ({ participant }: { participant: MeetingParticipant }) => {
        console.log("Participant joined:", participant);
        setParticipants((prev) => {
          const exists = prev.some((p) => p.userId === participant.userId);
          if (exists) {
            return prev.map((p) =>
              p.userId === participant.userId ? participant : p
            );
          }
          return [...prev, participant];
        });
        if (participant.userId !== userId) {
          createPeerConnection(participant.userId, newSocket);
        }
      }
    );

    newSocket.on(
      "participant-left",
      ({ userId: leftUserId }: { userId: string }) => {
        console.log("Participant left:", leftUserId);
        setParticipants((prev) => prev.filter((p) => p.userId !== leftUserId));
        if (peerConnections.current.has(leftUserId)) {
          peerConnections.current.get(leftUserId)?.connection.close();
          peerConnections.current.delete(leftUserId);
        }
        setRemoteStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.delete(leftUserId);
          return newStreams;
        });
      }
    );

    newSocket.on(
      "participant-status-updated",
      ({
        userId: updatedUserId,
        hasCamera,
        hasMicrophone,
        isScreenSharing,
      }: {
        userId: string;
        hasCamera: boolean;
        hasMicrophone: boolean;
        isScreenSharing: boolean;
      }) => {
        console.log(
          `Received participant-status-updated for user ${updatedUserId}:`,
          {
            hasCamera,
            hasMicrophone,
            isScreenSharing,
          }
        );
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === updatedUserId
              ? { ...p, hasCamera, hasMicrophone, isScreenSharing }
              : p
          )
        );
      }
    );

    newSocket.on(
      "offer",
      ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) =>
        handleOffer(from, offer, newSocket)
    );
    newSocket.on(
      "answer",
      ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) =>
        handleAnswer(from, answer)
    );
    newSocket.on(
      "ice-candidate",
      ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) =>
        handleIceCandidate(from, candidate)
    );

    newSocket.on(
      "hand-raised",
      ({ raisedHandUserId }: { raisedHandUserId: string }) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === raisedHandUserId ? { ...p, handRaised: true } : p
          )
        );
      }
    );

    newSocket.on(
      "hand-lowered",
      ({ loweredHandUserId }: { loweredHandUserId: string }) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === loweredHandUserId ? { ...p, handRaised: false } : p
          )
        );
      }
    );

    newSocket.on(
      "screen-share-started",
      ({ sharingUserId }: { sharingUserId: string }) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === sharingUserId ? { ...p, isScreenSharing: true } : p
          )
        );
      }
    );

    newSocket.on(
      "screen-share-stopped",
      ({ stoppedSharingUserId }: { stoppedSharingUserId: string }) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === stoppedSharingUserId
              ? { ...p, isScreenSharing: false }
              : p
          )
        );
      }
    );


    const currentPeerConnections = peerConnections.current;

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach((track) => track.stop());
      }
      currentPeerConnections.forEach((pc) => pc.connection.close());
      currentPeerConnections.clear();
      newSocket.disconnect();
    };
  }, [
    meetingId,
    userId,
    localStream,
    createPeerConnection,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    renegotiatePeerConnection,
  ]);

  const toggleCamera = useCallback(async (): Promise<void> => {
    if (!localStream) {
      const { hasVideo } = await checkDevices();
      if (!hasVideo) {
        setError("No camera found");
        return;
      }
      const stream = await initializeStream({ video: true });
      if (stream) {
        setHasCamera(true);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera: true,
          hasMicrophone,
          isScreenSharing,
        });
      }
    } else {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasCamera(videoTrack.enabled);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera: videoTrack.enabled,
          hasMicrophone,
          isScreenSharing,
        });
      }
    }
  }, [
    localStream,
    socket,
    meetingId,
    userId,
    hasMicrophone,
    isScreenSharing,
    initializeStream,
    checkDevices,
  ]);

  const toggleMicrophone = useCallback(async (): Promise<void> => {
    if (!localStream) {
      const { hasAudio } = await checkDevices();
      if (!hasAudio) {
        setError("No microphone found");
        return;
      }
      const stream = await initializeStream({ audio: true });
      if (stream) {
        setHasMicrophone(true);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera,
          hasMicrophone: true,
          isScreenSharing,
        });
      }
    } else {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setHasMicrophone(audioTrack.enabled);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera,
          hasMicrophone: audioTrack.enabled,
          isScreenSharing,
        });
      }
    }
  }, [
    localStream,
    socket,
    meetingId,
    userId,
    hasCamera,
    isScreenSharing,
    initializeStream,
    checkDevices,
  ]);

  const startScreenShare = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenShareStream.current = stream;
      setIsScreenSharing(true);
      socket?.emit("screen-share-started", { meetingId, userId });

      peerConnections.current.forEach((peer) => {
        stream
          .getTracks()
          .forEach((track) => peer.connection.addTrack(track, stream));
        renegotiatePeerConnection(peer.userId, peer.connection);
      });

      stream.getVideoTracks()[0].onended = stopScreenShare;
    } catch (error) {
      console.error("Error starting screen share:", error);
      setError("Failed to start screen sharing");
    }
  };

  const stopScreenShare = async (): Promise<void> => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track) => track.stop());
      screenShareStream.current = null;
      setIsScreenSharing(false);
      socket?.emit("screen-share-stopped", { meetingId, userId });

      peerConnections.current.forEach((peer) => {
        renegotiatePeerConnection(peer.userId, peer.connection);
      });
    }
  };

  const sendMessage = (
    message: string,
    isPrivate = false,
    receiverId?: string
  ): void => {
    if (!socket || !message.trim()) return;
    socket.emit("send-message", {
      meetingId,
      senderId: userId,
      message,
      isPrivate,
      receiverId: isPrivate ? receiverId : undefined,
    });
  };

  const raiseHand = (): void => {
    void socket?.emit("raise-hand", { meetingId, userId });
  };

  const lowerHand = (): void => {
    void socket?.emit("lower-hand", { meetingId, userId });
  };

  return {
    socket,
    localStream,
    remoteStreams,
    participants,
    isConnecting,
    error,
    hasCamera,
    hasMicrophone,
    isScreenSharing,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    raiseHand,
    lowerHand,
  };
};

export default useMeetingSocket;
