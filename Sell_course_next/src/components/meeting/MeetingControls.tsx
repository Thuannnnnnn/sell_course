import React from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhoneSlash,
  FaCommentAlt,
  FaHandPaper,
} from "react-icons/fa";

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
  isHandRaised,
}) => {
  const handleToggleCamera = async () => {
    try {
      await toggleCamera();
    } catch (error) {
      console.error("Error toggling camera:", error);
      alert(
        "Failed to toggle camera. Please check your permissions or device."
      );
    }
  };

  const handleToggleMicrophone = async () => {
    try {
      await toggleMicrophone();
    } catch (error) {
      console.error("Error toggling microphone:", error);
      alert(
        "Failed to toggle microphone. Please check your permissions or device."
      );
    }
  };

  return (
    <div className="meeting-controls">
      <button
        className={`control-btn ${hasMicrophone ? "active" : "inactive"}`}
        onClick={handleToggleMicrophone}
        title={hasMicrophone ? "Mute microphone" : "Unmute microphone"}
      >
        {hasMicrophone ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </button>

      <button
        className={`control-btn ${hasCamera ? "active" : "inactive"}`}
        onClick={handleToggleCamera}
        title={hasCamera ? "Turn off camera" : "Turn on camera"}
      >
        {hasCamera ? <FaVideo /> : <FaVideoSlash />}
      </button>

      <button
        className={`control-btn ${isScreenSharing ? "active" : "inactive"}`}
        onClick={isScreenSharing ? stopScreenShare : startScreenShare}
        title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
      >
        <FaDesktop />
      </button>

      <button className="control-btn" onClick={toggleChat} title="Toggle chat">
        <FaCommentAlt />
      </button>

      <button
        className={`control-btn ${isHandRaised ? "active" : "inactive"}`}
        onClick={isHandRaised ? lowerHand : raiseHand}
        title={isHandRaised ? "Lower hand" : "Raise hand"}
      >
        <FaHandPaper />
      </button>

      {isHost && endMeeting && (
        <button
          className="control-btn end-btn"
          onClick={endMeeting}
          title="End meeting for all"
        >
          End
        </button>
      )}

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
          padding: 10px;
          border-radius: 50px;
          gap: 10px;
          margin: 10px auto;
          width: fit-content;
        }

        .control-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #333;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .control-btn:hover {
          background-color: #444;
        }

        .control-btn.active {
          background-color: #0d6efd;
        }

        .control-btn.inactive {
          background-color: #333;
        }

        .control-btn.leave-btn {
          background-color: #dc3545;
        }

        .control-btn.leave-btn:hover {
          background-color: #bb2d3b;
        }

        .control-btn.end-btn {
          background-color: #dc3545;
          border-radius: 20px;
          padding: 0 15px;
          font-size: 14px;
          width: auto;
        }

        .control-btn.end-btn:hover {
          background-color: #bb2d3b;
        }
      `}</style>
    </div>
  );
};

export default MeetingControls;
