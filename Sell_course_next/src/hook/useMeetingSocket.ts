import { useEffect, useState, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { MeetingParticipant, MeetingMessage } from "../app/api/meeting/meeting";
import { debounce } from "lodash";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface SocketEventData {
  from: string;
  offer: RTCSessionDescriptionInit;
  answer: RTCSessionDescriptionInit;
  candidate: RTCIceCandidateInit;
  userId: string;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
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

  // Kiểm tra thiết bị camera và mic
  const checkDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((device) => device.kind === "videoinput");
      const hasAudio = devices.some((device) => device.kind === "audioinput");

      if (!hasVideo && !hasAudio) {
        setError("No camera or microphone detected on your device.");
        return { hasVideo: false, hasAudio: false };
      }
      return { hasVideo, hasAudio };
    } catch (err) {
      setError("Unable to enumerate devices: " + (err as Error).message);
      return { hasVideo: false, hasAudio: false };
    }
  };

  // Khởi tạo stream
  const initializeStream = useCallback(
    async (forceReinitialize = false) => {
      if (localStream && !forceReinitialize) {
        console.log("Stream already initialized:", localStream);
        return localStream;
      }

      const devices = await checkDevices();
      if (!devices.hasVideo && !devices.hasAudio) {
        setIsConnecting(false);
        return null;
      }

      try {
        const constraints = {
          video: devices.hasVideo ? true : false,
          audio: devices.hasAudio ? true : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Stream initialized successfully:", stream);

        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        // Khởi tạo trạng thái ban đầu
        if (videoTracks.length > 0) {
          videoTracks.forEach((track) => {
            track.enabled = false; // Tắt camera mặc định
            console.log("Initial video track state:", track.enabled);
          });
          setHasCamera(false);
        } else {
          setHasCamera(false);
          setError((prev) => prev || "No camera available.");
        }

        if (audioTracks.length > 0) {
          audioTracks.forEach((track) => {
            track.enabled = false; // Tắt mic mặc định
            console.log("Initial audio track state:", track.enabled);
          });
          setHasMicrophone(false);
        } else {
          setHasMicrophone(false);
          setError((prev) => prev || "No microphone available.");
        }

        setLocalStream(stream);
        setIsConnecting(false);
        return stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError(
              "Camera and microphone access denied. Please allow permissions in your browser settings."
            );
          } else if (err.name === "NotFoundError") {
            setError("No camera or microphone found on your device.");
          } else {
            setError(
              "An error occurred while accessing media devices: " + err.message
            );
          }
        }
        setIsConnecting(false);
        return null;
      }
    },
    [localStream]
  );

  useEffect(() => {
    if (!meetingId || !userId) return;

    const newSocket = io(`${API_URL}/meetings`, {
      query: { meetingId, userId },
    });

    setSocket(newSocket);

    // Khởi tạo stream khi socket được thiết lập
    initializeStream().then((stream) => {
      if (stream) {
        newSocket.emit("join-meeting", { meetingId, userId });
        newSocket.emit("update-status", {
          meetingId,
          userId,
          hasCamera: false,
          hasMicrophone: false,
          isScreenSharing: false,
        });
      } else {
        setError(
          "Failed to initialize media stream. Please check your camera and microphone."
        );
      }
    });

    newSocket.on("connect", () => {
      console.log("Connected to meeting socket server");
    });

    newSocket.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err);
      setError("Failed to connect to the meeting server. Please try again.");
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
          } else {
            return [...prev, participant];
          }
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
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === leftUserId ? { ...p, isActive: false } : p
          )
        );

        if (peerConnections.current.has(leftUserId)) {
          const peerConnection = peerConnections.current.get(leftUserId);
          peerConnection?.connection.close();
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
        hasCamera: updatedHasCamera,
        hasMicrophone: updatedHasMicrophone,
        isScreenSharing: updatedIsScreenSharing,
      }: {
        userId: string;
        hasCamera: boolean;
        hasMicrophone: boolean;
        isScreenSharing: boolean;
      }) => {
        console.log(
          `Received participant-status-updated for user ${updatedUserId}:`,
          {
            hasCamera: updatedHasCamera,
            hasMicrophone: updatedHasMicrophone,
            isScreenSharing: updatedIsScreenSharing,
          }
        );
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === updatedUserId
              ? {
                  ...p,
                  hasCamera: updatedHasCamera,
                  hasMicrophone: updatedHasMicrophone,
                  isScreenSharing: updatedIsScreenSharing,
                }
              : p
          )
        );
      }
    );

    newSocket.on(
      "offer",
      ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
        handleOffer(from, offer, newSocket);
      }
    );

    newSocket.on(
      "answer",
      ({
        from,
        answer,
      }: {
        from: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        handleAnswer(from, answer);
      }
    );

    newSocket.on(
      "ice-candidate",
      ({
        from,
        candidate,
      }: {
        from: string;
        candidate: RTCIceCandidateInit;
      }) => {
        handleIceCandidate(from, candidate);
      }
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
      cleanupResources();
      newSocket.disconnect();
    };
  }, [meetingId, userId, initializeStream]);

  const createPeerConnection = (
    participantId: string,
    socket: typeof Socket
  ): PeerConnection => {
    const connection = new RTCPeerConnection(iceServers);
    const peerConnection: PeerConnection = {
      userId: participantId,
      connection,
      stream: undefined,
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        console.log(
          `Adding track to peer connection for ${participantId}:`,
          track
        );
        connection.addTrack(track, localStream);
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

    connection.onconnectionstatechange = () => {
      console.log(
        `Connection state for ${participantId}:`,
        connection.connectionState
      );
    };

    connection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log(
        `Received remote stream from ${participantId}:`,
        remoteStream
      );
      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        newStreams.set(participantId, remoteStream);
        return newStreams;
      });
      peerConnection.stream = remoteStream;
    };

    if (userId < participantId) {
      connection
        .createOffer()
        .then((offer) => connection.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", {
            to: participantId,
            offer: connection.localDescription,
          });
        })
        .catch((err) => console.error("Error creating offer:", err));
    }

    peerConnections.current.set(participantId, peerConnection);
    return peerConnection;
  };

  const handleOffer = async (
    from: string,
    offer: RTCSessionDescriptionInit,
    socket: typeof Socket
  ) => {
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
  };

  const handleAnswer = async (
    from: string,
    answer: RTCSessionDescriptionInit
  ) => {
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
  ) => {
    const peerConnection = peerConnections.current.get(from);
    if (peerConnection) {
      await peerConnection.connection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }
  };

  const toggleCamera = useCallback(() => {
    const debouncedToggle = debounce(async () => {
      console.log("Executing debounced toggleCamera");
      if (!localStream) {
        const stream = await initializeStream(true);
        if (!stream) {
          setError("Failed to initialize stream. Please check your camera.");
          return;
        }
      }

      const videoTracks = localStream?.getVideoTracks();
      if (!videoTracks || videoTracks.length === 0) {
        setError("No camera available to toggle.");
        return;
      }

      const newState = !hasCamera;
      videoTracks.forEach((track) => {
        track.enabled = newState;
        console.log(`Video track enabled state after toggle: ${track.enabled}`);
      });

      setHasCamera(newState);

      if (socket) {
        socket.emit("update-status", {
          meetingId,
          userId,
          hasCamera: newState,
          hasMicrophone,
          isScreenSharing,
        });
      }

      peerConnections.current.forEach((peer) => {
        const senders = peer.connection.getSenders();
        videoTracks.forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === "video");
          if (sender) {
            console.log("Replacing video track in peer connection:", track);
            sender.replaceTrack(newState ? track : null);
          }
        });
      });
    }, 500);

    // Wrap the debounced function to ensure it always returns a Promise<void>
    return new Promise<void>((resolve) => {
      const result = debouncedToggle();
      if (result) {
        console.log("toggleCamera: Debounced function returned a Promise");
        result
          .then(() => resolve())
          .catch((err) => {
            console.error("toggleCamera: Error in debounced function:", err);
            resolve(); // Resolve even on error to avoid hanging
          });
      } else {
        console.log(
          "toggleCamera: Debounced function was throttled, resolving immediately"
        );
        resolve();
      }
    });
  }, [
    localStream,
    hasCamera,
    socket,
    meetingId,
    userId,
    hasMicrophone,
    isScreenSharing,
    initializeStream,
  ]);

  const toggleMicrophone = useCallback(() => {
    const debouncedToggle = debounce(async () => {
      console.log("Executing debounced toggleMicrophone");
      if (!localStream) {
        const stream = await initializeStream(true);
        if (!stream) {
          setError(
            "Failed to initialize stream. Please check your microphone."
          );
          return;
        }
      }

      const audioTracks = localStream?.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        setError("No microphone available to toggle.");
        return;
      }

      const newState = !hasMicrophone;
      audioTracks.forEach((track) => {
        track.enabled = newState;
        console.log(`Audio track enabled state after toggle: ${track.enabled}`);
      });

      setHasMicrophone(newState);

      if (socket) {
        socket.emit("update-status", {
          meetingId,
          userId,
          hasCamera,
          hasMicrophone: newState,
          isScreenSharing,
        });
      }

      peerConnections.current.forEach((peer) => {
        const senders = peer.connection.getSenders();
        audioTracks.forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(newState ? track : null);
          }
        });
      });
    }, 500);

    // Wrap the debounced function to ensure it always returns a Promise<void>
    return new Promise<void>((resolve) => {
      const result = debouncedToggle();
      if (result) {
        console.log("toggleMicrophone: Debounced function returned a Promise");
        result
          .then(() => resolve())
          .catch((err) => {
            console.error(
              "toggleMicrophone: Error in debounced function:",
              err
            );
            resolve(); // Resolve even on error to avoid hanging
          });
      } else {
        console.log(
          "toggleMicrophone: Debounced function was throttled, resolving immediately"
        );
        resolve();
      }
    });
  }, [
    localStream,
    hasMicrophone,
    socket,
    meetingId,
    userId,
    hasCamera,
    isScreenSharing,
    initializeStream,
  ]);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenShareStream.current = stream;
      setIsScreenSharing(true);
      socket?.emit("screen-share-started", { meetingId, userId });

      peerConnections.current.forEach((peer) => {
        stream.getTracks().forEach((track) => {
          peer.connection.addTrack(track, stream);
        });
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error starting screen share:", error);
      setError("Failed to start screen sharing");
    }
  };

  const stopScreenShare = async () => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track) => track.stop());
      screenShareStream.current = null;
      setIsScreenSharing(false);
      socket?.emit("screen-share-stopped", { meetingId, userId });
    }
  };

  const sendMessage = (
    message: string,
    isPrivate = false,
    receiverId?: string
  ) => {
    if (!socket || !message.trim()) return;

    socket.emit("send-message", {
      meetingId,
      senderId: userId,
      message,
      isPrivate,
      receiverId: isPrivate ? receiverId : undefined,
    });
  };

  const raiseHand = () => {
    if (!socket) return;
    socket.emit("raise-hand", { meetingId, userId });
  };

  const lowerHand = () => {
    if (!socket) return;
    socket.emit("lower-hand", { meetingId, userId });
  };

  const cleanupResources = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track) => track.stop());
    }

    peerConnections.current.forEach(({ connection }) => {
      connection.close();
    });

    peerConnections.current.clear();
    setRemoteStreams(new Map());
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
