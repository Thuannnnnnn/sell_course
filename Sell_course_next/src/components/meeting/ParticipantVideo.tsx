import React, { useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  FaUser,
} from "react-icons/fa";

interface ParticipantVideoProps {
  stream: MediaStream | null;
  displayName: string;
  isActive: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
  isLocal?: boolean;
  isSpeaking?: boolean;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  stream,
  displayName,
  isActive,
  hasCamera,
  hasMicrophone,
  isScreenSharing,
  isLocal = false,
  isSpeaking = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream && hasCamera) {
      videoElement.srcObject = stream;
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    } else if (videoElement) {
      videoElement.srcObject = null;
    }
  }, [stream, hasCamera]);

  if (!isActive) {
    return null;
  }

  return (
    <div className={`participant-video ${isSpeaking ? "speaking" : ""}`}>
      {stream && hasCamera ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="video-stream"
        />
      ) : (
        <div className="avatar-placeholder">
          <FaUser size={48} />
          <div className="display-name">
            {displayName}
            {isLocal ? " (You)" : ""}
          </div>
          {!hasCamera && <span className="status-text">Camera Off</span>}
        </div>
      )}

      <div className="participant-info">
        <div className="display-name">
          {displayName}
          {isLocal ? " (You)" : ""}
        </div>
        <div className="participant-controls">
          {isScreenSharing && (
            <FaDesktop className="control-icon screen-share" />
          )}
          {hasMicrophone ? (
            <FaMicrophone className="control-icon" />
          ) : (
            <FaMicrophoneSlash className="control-icon muted" />
          )}
        </div>
      </div>

      <style jsx>{`
        .participant-video {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          background-color: #1a1a1a;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .participant-video.speaking {
          border: 2px solid #0d6efd;
        }

        .video-stream {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
          transition: opacity 0.5s ease;
        }

        .avatar-placeholder {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background-color: #333;
          color: white;
          gap: 8px;
        }

        .status-text {
          font-size: 12px;
          color: #ccc;
        }

        .participant-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
        }

        .display-name {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        .participant-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .control-icon {
          font-size: 14px;
        }

        .control-icon.muted {
          color: #dc3545;
        }

        .control-icon.screen-share {
          color: #0d6efd;
        }
      `}</style>
    </div>
  );
};

export default ParticipantVideo;
