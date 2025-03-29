import React, { useState } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaDesktop, 
  FaPhoneSlash,
  FaCommentAlt,
  FaHandPaper,
  FaEllipsisH
} from 'react-icons/fa';
import { Dropdown } from 'react-bootstrap';

interface MeetingControlsProps {
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  leaveMeeting: () => void;
  endMeeting?: () => void;
  toggleChat: () => void;
  raiseHand: () => void;
  lowerHand: () => void;
  isHandRaised: boolean;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  hasCamera,
  hasMicrophone,
  isScreenSharing,
  isHost,
  toggleCamera,
  toggleMicrophone,
  startScreenShare,
  stopScreenShare,
  leaveMeeting,
  endMeeting,
  toggleChat,
  raiseHand,
  lowerHand,
  isHandRaised
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  return (
    <div className="meeting-controls">
      <button 
        className={`control-btn ${hasMicrophone ? 'active' : ''}`}
        onClick={toggleMicrophone}
        title={hasMicrophone ? 'Mute microphone' : 'Unmute microphone'}
      >
        {hasMicrophone ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </button>

      <button 
        className={`control-btn ${hasCamera ? 'active' : ''}`}
        onClick={toggleCamera}
        title={hasCamera ? 'Turn off camera' : 'Turn on camera'}
      >
        {hasCamera ? <FaVideo /> : <FaVideoSlash />}
      </button>

      <button 
        className={`control-btn ${isScreenSharing ? 'active' : ''}`}
        onClick={isScreenSharing ? stopScreenShare : startScreenShare}
        title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
      >
        <FaDesktop />
      </button>

      <button 
        className="control-btn"
        onClick={toggleChat}
        title="Toggle chat"
      >
        <FaCommentAlt />
      </button>

      <button 
        className={`control-btn ${isHandRaised ? 'active' : ''}`}
        onClick={isHandRaised ? lowerHand : raiseHand}
        title={isHandRaised ? 'Lower hand' : 'Raise hand'}
      >
        <FaHandPaper />
      </button>

      <Dropdown>
        <Dropdown.Toggle as="button" className="control-btn">
          <FaEllipsisH />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {isHost && (
            <Dropdown.Item onClick={endMeeting}>End meeting for all</Dropdown.Item>
          )}
          <Dropdown.Item onClick={leaveMeeting}>Leave meeting</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <button 
        className="control-btn leave-btn"
        onClick={leaveMeeting}
        title="Leave meeting"
      >
        <FaPhoneSlash />
      </button>

      <style jsx>{`
        .meeting-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #1a1a1a;
          padding: 15px;
          border-radius: 10px;
          margin-top: 10px;
        }
        
        .control-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #333;
          color: white;
          border: none;
          margin: 0 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .control-btn:hover {
          background-color: #444;
        }
        
        .control-btn.active {
          background-color: #0d6efd;
        }
        
        .control-btn.leave-btn {
          background-color: #dc3545;
        }
        
        .control-btn.leave-btn:hover {
          background-color: #bb2d3b;
        }
      `}</style>
    </div>
  );
};

export default MeetingControls;