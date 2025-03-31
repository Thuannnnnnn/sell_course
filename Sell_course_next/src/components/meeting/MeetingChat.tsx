import React from 'react';
import useMeetingSocket from '../../hook/useMeetingSocket';
import ParticipantVideo from './ParticipantVideo';
import MeetingControls from './MeetingControls';

interface MeetingChatProps {
  meetingId: string;
  userId: string;
}

const MeetingChat: React.FC<MeetingChatProps> = ({ meetingId, userId }) => {
  const {
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
    stopScreenShare
  } = useMeetingSocket(meetingId, userId);

  if (isConnecting) {
    return <div>Connecting to meeting...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="meeting-container">
      <div className="video-grid">
        {/* Local video */}
        {localStream && (
          <ParticipantVideo
            stream={localStream}
            displayName="You"
            isLocal={true}
            isActive={true}
            hasCamera={hasCamera}
            hasMicrophone={hasMicrophone}
            isScreenSharing={isScreenSharing}
          />
        )}
        
        {/* Remote videos */}
        {Array.from(remoteStreams).map(([participantId, stream]) => {
          const participant = participants.find(p => p.userId === participantId);
          return (
            <ParticipantVideo
              key={participantId}
              stream={stream}
              displayName={participant?.user?.username || 'Unknown'}
              isLocal={false}
              isActive={participant?.isActive ?? true}
              hasCamera={participant?.hasCamera ?? false}
              hasMicrophone={participant?.hasMicrophone ?? false}
              isScreenSharing={participant?.isScreenSharing ?? false}
            />
          );
        })}
      </div>

      <MeetingControls
        localStream={localStream}
        hasCamera={hasCamera}
        hasMicrophone={hasMicrophone}
        isScreenSharing={isScreenSharing}
        isHost={false}
        toggleCamera={toggleCamera}
        toggleMicrophone={toggleMicrophone}
        startScreenShare={startScreenShare}
        stopScreenShare={stopScreenShare}
        leaveMeeting={() => {}}
        raiseHand={() => {}}
        lowerHand={() => {}}
        isHandRaised={false}
      />
    </div>
  );
};

export default MeetingChat;
