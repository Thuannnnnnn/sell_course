import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MeetingParticipant, MeetingMessage } from '../app/api/meeting/meeting';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface UseMeetingSocketResult {
  socket: Socket | null;
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
  sendMessage: (message: string, isPrivate?: boolean, receiverId?: string) => void;
  raiseHand: () => void;
  lowerHand: () => void;
}

const useMeetingSocket = (
  meetingId: string,
  userId: string
): UseMeetingSocketResult => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [hasMicrophone, setHasMicrophone] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  
  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
  const screenShareStream = useRef<MediaStream | null>(null);

  // ICE servers configuration for WebRTC
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize media stream
  const initializeStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      // Start with camera and microphone off
      stream.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
      
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      
      setLocalStream(stream);
      setIsConnecting(false);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check your permissions.');
      setIsConnecting(false);
      return null;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!meetingId || !userId) return;

    const newSocket = io(`${API_URL}/meetings`, {
      query: { meetingId, userId },
    });

    setSocket(newSocket);

    // Initialize media stream
    initializeStream().then(stream => {
      if (stream) {
        // Join the meeting room
        newSocket.emit('join-meeting', { meetingId, userId });
      }
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to meeting socket server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to the meeting server. Please try again.');
    });

    newSocket.on('current-participants', (currentParticipants: MeetingParticipant[]) => {
      setParticipants(currentParticipants);
      
      // Create peer connections for existing participants
      currentParticipants.forEach(participant => {
        if (participant.userId !== userId && participant.isActive) {
          createPeerConnection(participant.userId, newSocket);
        }
      });
    });

    newSocket.on('participant-joined', ({ participant }: { participant: MeetingParticipant }) => {
      setParticipants(prev => {
        const exists = prev.some(p => p.userId === participant.userId);
        if (exists) {
          return prev.map(p => p.userId === participant.userId ? participant : p);
        } else {
          return [...prev, participant];
        }
      });

      // Create peer connection for new participant
      if (participant.userId !== userId) {
        createPeerConnection(participant.userId, newSocket);
      }
    });

    newSocket.on('participant-left', ({ userId: leftUserId }: { userId: string }) => {
      setParticipants(prev => 
        prev.map(p => p.userId === leftUserId ? { ...p, isActive: false } : p)
      );

      // Close and remove peer connection
      if (peerConnections.current.has(leftUserId)) {
        const peerConnection = peerConnections.current.get(leftUserId);
        if (peerConnection) {
          peerConnection.connection.close();
        }
        peerConnections.current.delete(leftUserId);
      }

      // Remove remote stream
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(leftUserId);
        return newStreams;
      });
    });

    newSocket.on('participant-status-updated', ({ 
      userId: updatedUserId, 
      hasCamera: updatedHasCamera, 
      hasMicrophone: updatedHasMicrophone,
      isScreenSharing: updatedIsScreenSharing 
    }) => {
      setParticipants(prev => 
        prev.map(p => p.userId === updatedUserId ? { 
          ...p, 
          hasCamera: updatedHasCamera, 
          hasMicrophone: updatedHasMicrophone,
          isScreenSharing: updatedIsScreenSharing
        } : p)
      );
    });

    newSocket.on('new-message', (message: MeetingMessage) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('offer', async ({ from, offer }) => {
      console.log('Received offer from:', from);
      
      // Create peer connection if it doesn't exist
      let peerConnection = peerConnections.current.get(from);
      if (!peerConnection) {
        peerConnection = createPeerConnection(from, newSocket);
      }

      try {
        await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.connection.createAnswer();
        await peerConnection.connection.setLocalDescription(answer);
        
        newSocket.emit('answer', {
          to: from,
          answer: peerConnection.connection.localDescription
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    newSocket.on('answer', async ({ from, answer }) => {
      console.log('Received answer from:', from);
      const peerConnection = peerConnections.current.get(from);
      
      if (peerConnection && peerConnection.connection.signalingState !== 'closed') {
        try {
          await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      }
    });

    newSocket.on('ice-candidate', async ({ from, candidate }) => {
      console.log('Received ICE candidate from:', from);
      const peerConnection = peerConnections.current.get(from);
      
      if (peerConnection && peerConnection.connection.signalingState !== 'closed') {
        try {
          await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    newSocket.on('hand-raised', ({ userId: raisedHandUserId }) => {
      // Handle hand raised event (could update UI or show notification)
      console.log(`${raisedHandUserId} raised hand`);
    });

    newSocket.on('hand-lowered', ({ userId: loweredHandUserId }) => {
      // Handle hand lowered event
      console.log(`${loweredHandUserId} lowered hand`);
    });

    newSocket.on('screen-shared', ({ userId: sharingUserId }) => {
      // Handle screen sharing started event
      console.log(`${sharingUserId} started sharing screen`);
    });

    newSocket.on('screen-share-stopped', ({ userId: stoppedSharingUserId }) => {
      // Handle screen sharing stopped event
      console.log(`${stoppedSharingUserId} stopped sharing screen`);
    });

    newSocket.on('meeting-ended', () => {
      // Handle meeting ended event
      alert('The meeting has been ended by the host.');
      // Clean up resources
      cleanupResources();
    });

    // Clean up on unmount
    return () => {
      cleanupResources();
      newSocket.disconnect();
    };
  }, [meetingId, userId, initializeStream]);

  // Create a peer connection for a participant
  const createPeerConnection = (participantId: string, socket: Socket): PeerConnection => {
    console.log('Creating peer connection for:', participantId);
    
    const connection = new RTCPeerConnection(iceServers);
    const peerConnection: PeerConnection = { userId: participantId, connection };
    
    // Add local stream tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        connection.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: participantId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}:`, connection.connectionState);
    };

    // Handle tracks from remote peer
    connection.ontrack = (event) => {
      console.log('Received remote track from:', participantId);
      
      const [remoteStream] = event.streams;
      
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(participantId, remoteStream);
        return newStreams;
      });
      
      peerConnection.stream = remoteStream;
    };

    // Create and send offer (if we're the initiator)
    if (userId < participantId) {
      connection.createOffer()
        .then(offer => connection.setLocalDescription(offer))
        .then(() => {
          socket.emit('offer', {
            to: participantId,
            offer: connection.localDescription
          });
        })
        .catch(err => console.error('Error creating offer:', err));
    }

    // Store the peer connection
    peerConnections.current.set(participantId, peerConnection);
    
    return peerConnection;
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (!localStream) return;
    
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) return;
    
    const newState = !hasCamera;
    videoTracks.forEach(track => {
      track.enabled = newState;
    });
    
    setHasCamera(newState);
    
    // Update participant status on server
    if (socket) {
      socket.emit('update-status', {
        meetingId,
        userId,
        hasCamera: newState,
        hasMicrophone,
        isScreenSharing
      });
    }
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    if (!localStream) return;
    
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) return;
    
    const newState = !hasMicrophone;
    audioTracks.forEach(track => {
      track.enabled = newState;
    });
    
    setHasMicrophone(newState);
    
    // Update participant status on server
    if (socket) {
      socket.emit('update-status', {
        meetingId,
        userId,
        hasCamera,
        hasMicrophone: newState,
        isScreenSharing
      });
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenShareStream.current = stream;
      
      // Replace video track in all peer connections
      const videoTrack = stream.getVideoTracks()[0];
      
      peerConnections.current.forEach(({ connection }) => {
        const senders = connection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      });
      
      setIsScreenSharing(true);
      
      // Update participant status on server
      if (socket) {
        socket.emit('update-status', {
          meetingId,
          userId,
          hasCamera,
          hasMicrophone,
          isScreenSharing: true
        });
        
        socket.emit('share-screen', { meetingId, userId });
      }
      
      // Handle screen share ended by user
      videoTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error('Error starting screen share:', err);
      setError('Failed to start screen sharing. Please try again.');
    }
  };

  // Stop screen sharing
  const stopScreenShare = async () => {
    if (!screenShareStream.current) return;
    
    // Stop all tracks in the screen share stream
    screenShareStream.current.getTracks().forEach(track => track.stop());
    
    // Replace with original video track from local stream
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      
      peerConnections.current.forEach(({ connection }) => {
        const senders = connection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        }
      });
    }
    
    setIsScreenSharing(false);
    screenShareStream.current = null;
    
    // Update participant status on server
    if (socket) {
      socket.emit('update-status', {
        meetingId,
        userId,
        hasCamera,
        hasMicrophone,
        isScreenSharing: false
      });
      
      socket.emit('stop-screen-share', { meetingId, userId });
    }
  };

  // Send a message
  const sendMessage = (message: string, isPrivate = false, receiverId?: string) => {
    if (!socket || !message.trim()) return;
    
    socket.emit('send-message', {
      meetingId,
      senderId: userId,
      message,
      isPrivate,
      receiverId: isPrivate ? receiverId : undefined
    });
  };

  // Raise hand
  const raiseHand = () => {
    if (!socket) return;
    socket.emit('raise-hand', { meetingId, userId });
  };

  // Lower hand
  const lowerHand = () => {
    if (!socket) return;
    socket.emit('lower-hand', { meetingId, userId });
  };

  // Clean up resources
  const cleanupResources = () => {
    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Stop screen share stream tracks
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
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
    lowerHand
  };
};

export default useMeetingSocket;