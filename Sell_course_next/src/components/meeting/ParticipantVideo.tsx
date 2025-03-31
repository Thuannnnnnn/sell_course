import React, { useRef, useEffect, useState } from "react";
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
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream && hasCamera && isActive) {
      videoElement.srcObject = stream;
      videoElement.play().catch((error) => {
        console.error(`Error playing video for ${displayName}:`, error);
        setPlayError("Failed to play video.");
      });
    } else if (videoElement) {
      videoElement.srcObject = null;
    }
  }, [stream, hasCamera, isActive, displayName]);

  if (!isActive) return null;

  return (
    <div className={`participant-video ${isSpeaking ? "speaking" : ""}`}>
      {stream && hasCamera ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="video-stream"
          />
          {playError && (
            <div className="play-error">
              {playError}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                    setPlayError(null);
                  }
                }}
              >
                Retry
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="avatar-placeholder">
          <FaUser size={48} />
          <div className="display-name">
            {displayName}
            {isLocal ? " (You)" : ""}
          </div>
          <span className="status-text">
            {hasCamera ? "Stream unavailable" : "Camera Off"}
          </span>
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
    </div>
  );
};

export default ParticipantVideo;
