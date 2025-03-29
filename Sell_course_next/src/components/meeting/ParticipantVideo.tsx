import React, { useRef, useEffect, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaDesktop, FaUser } from 'react-icons/fa';

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
  isSpeaking = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Handle video loaded event
      const handleVideoLoaded = () => {
        setVideoLoaded(true);
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleVideoLoaded);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleVideoLoaded);
        }
      };
    }
  }, [stream]);

  if (!isActive) {
    return null;
  }

  return (
    <div className={`participant-video ${isSpeaking ? 'speaking' : ''}`}>
      {hasCamera && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={videoLoaded ? 'visible' : 'hidden'}
        />
      ) : (
        <div className="avatar-placeholder">
          <FaUser />
          <div className="display-name">{displayName}</div>
        </div>
      )}
      
      <div className="participant-info">
        <div className="display-name">{displayName}{isLocal ? ' (You)' : ''}</div>
        <div className="participant-controls">
          {isScreenSharing && <FaDesktop className="control-icon screen-share" />}
          {hasMicrophone ? 
            <FaMicrophone className="control-icon" /> : 
            <FaMicrophoneSlash className="control-icon muted" />
          }
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
        
        .participant-video video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .participant-video video.hidden {
          opacity: 0;
        }
        
        .participant-video video.visible {
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
          font-size: 3rem;
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
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
        }
        
        .display-name {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .participant-controls {
          display: flex;
          gap: 8px;
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