"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { MeetingParticipant, MeetingMessage } from "../app/api/meeting/meeting";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  messages: MeetingMessage[];
  isConnecting: boolean;
  error: string | null;
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
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [hasMicrophone, setHasMicrophone] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
  const screenShareStream = useRef<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const checkDevices = async (): Promise<{
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
  };

  const initializeStream = useCallback(
    async (
      constraints: MediaStreamConstraints
    ): Promise<MediaStream | null> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Stream initialized successfully:", stream);
        setLocalStream(stream);

        // Thêm track vào peer connections ngay khi khởi tạo
        peerConnections.current.forEach((peer) => {
          stream.getTracks().forEach((track) => {
            peer.connection.addTrack(track, stream);
          });
          // Tạo lại offer để gửi stream mới
          renegotiatePeerConnection(peer.userId, peer.connection);
        });

        return stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Failed to access media devices. Please check permissions.");
        return null;
      }
    },
    []
  );

  const stopStreamTracks = (stream: MediaStream, kind: "audio" | "video") => {
    const tracks =
      kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
    tracks.forEach((track) => track.stop());
    console.log(`${kind} tracks stopped`);
  };

  const renegotiatePeerConnection = async (
    participantId: string,
    connection: RTCPeerConnection
  ) => {
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
  };

  useEffect(() => {
    if (!meetingId || !userId) return;

    const newSocket = io(`${API_URL}/meetings`, {
      query: { meetingId, userId },
    });

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

    newSocket.on("message", (message: MeetingMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("private-message", (message: MeetingMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach((track) => track.stop());
      }
      peerConnections.current.forEach((pc) => pc.connection.close());
      peerConnections.current.clear();
      newSocket.disconnect();
    };
  }, [meetingId, userId]);

  const createPeerConnection = (
    participantId: string,
    socket: typeof Socket
  ): PeerConnection => {
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

    // Tạo offer ngay khi kết nối nếu userId nhỏ hơn
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
  };

  const handleOffer = async (
    from: string,
    offer: RTCSessionDescriptionInit,
    socket: typeof Socket
  ): Promise<void> => {
    let peerConnection = peerConnections.current.get(from);
    if (!peerConnection) peerConnection = createPeerConnection(from, socket);

    await peerConnection.connection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.connection.createAnswer();
    await peerConnection.connection.setLocalDescription(answer);
    socket.emit("answer", {
      to: from,
      answer: peerConnection.connection.localDescription,
    });
  };

  const handleAnswer = async (
    from: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> => {
    const peerConnection = peerConnections.current.get(from);
    if (peerConnection) {
      await peerConnection.connection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  const handleIceCandidate = async (
    from: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> => {
    const peerConnection = peerConnections.current.get(from);
    if (peerConnection && peerConnection.connection.remoteDescription) {
      await peerConnection.connection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }
  };

  const toggleCamera = useCallback(async (): Promise<void> => {
    const devices = await checkDevices();
    if (!devices.hasVideo) {
      setError("No camera available.");
      return;
    }

    if (!localStream || !localStream.getVideoTracks().length) {
      const stream = await initializeStream({
        video: true,
        audio: hasMicrophone,
      });
      if (!stream) return;

      setHasCamera(true);
      socket?.emit("update-status", {
        meetingId,
        userId,
        hasCamera: true,
        hasMicrophone,
        isScreenSharing,
      });
    } else {
      const videoTracks = localStream.getVideoTracks();
      if (hasCamera) {
        stopStreamTracks(localStream, "video");
        setHasCamera(false);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera: false,
          hasMicrophone,
          isScreenSharing,
        });

        if (!localStream.getAudioTracks().length) {
          setLocalStream(null);
        }

        peerConnections.current.forEach((peer) => {
          const senders = peer.connection.getSenders();
          videoTracks.forEach(() => {
            const sender = senders.find((s) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(null);
          });
          renegotiatePeerConnection(peer.userId, peer.connection);
        });
      } else {
        const stream = await initializeStream({
          video: true,
          audio: hasMicrophone,
        });
        if (!stream) return;

        setHasCamera(true);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera: true,
          hasMicrophone,
          isScreenSharing,
        });
      }
    }
  }, [
    localStream,
    hasCamera,
    hasMicrophone,
    socket,
    meetingId,
    userId,
    isScreenSharing,
    initializeStream,
  ]);

  const toggleMicrophone = useCallback(async (): Promise<void> => {
    const devices = await checkDevices();
    if (!devices.hasAudio) {
      setError("No microphone available.");
      return;
    }

    if (!localStream || !localStream.getAudioTracks().length) {
      const stream = await initializeStream({ video: hasCamera, audio: true });
      if (!stream) return;

      setHasMicrophone(true);
      socket?.emit("update-status", {
        meetingId,
        userId,
        hasCamera,
        hasMicrophone: true,
        isScreenSharing,
      });
    } else {
      const audioTracks = localStream.getAudioTracks();
      if (hasMicrophone) {
        stopStreamTracks(localStream, "audio");
        setHasMicrophone(false);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera,
          hasMicrophone: false,
          isScreenSharing,
        });

        if (!localStream.getVideoTracks().length) {
          setLocalStream(null);
        }

        peerConnections.current.forEach((peer) => {
          const senders = peer.connection.getSenders();
          audioTracks.forEach(() => {
            const sender = senders.find((s) => s.track?.kind === "audio");
            if (sender) sender.replaceTrack(null);
          });
          renegotiatePeerConnection(peer.userId, peer.connection);
        });
      } else {
        const stream = await initializeStream({
          video: hasCamera,
          audio: true,
        });
        if (!stream) return;

        setHasMicrophone(true);
        socket?.emit("update-status", {
          meetingId,
          userId,
          hasCamera,
          hasMicrophone: true,
          isScreenSharing,
        });
      }
    }
  }, [
    localStream,
    hasMicrophone,
    hasCamera,
    socket,
    meetingId,
    userId,
    isScreenSharing,
    initializeStream,
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
    messages,
    isConnecting,
    error,
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
