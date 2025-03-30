import React from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaUser, FaTimes } from 'react-icons/fa';
import { MeetingParticipant } from '../../app/api/meeting/meeting';

interface ParticipantsListProps {
  participants: MeetingParticipant[];
  currentUserId: string;
  onClose: () => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  onClose
}) => {
  // Filter active participants
  const activeParticipants = participants.filter(p => p.isActive);

  return (
    <div className="participants-list">
      <div className="participants-header">
        <h5>Participants ({activeParticipants.length})</h5>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="participants-container">
        {activeParticipants.length === 0 ? (
          <div className="no-participants">No participants</div>
        ) : (
          activeParticipants.map(participant => (
            <div 
              key={participant.id} 
              className={`participant-item ${participant.userId === currentUserId ? 'current-user' : ''}`}
            >
              <div className="participant-avatar">
                <FaUser />
              </div>
              <div className="participant-info">
                <div className="participant-name">
                  {participant.user?.name || 'Unknown User'}
                  {participant.userId === currentUserId && ' (You)'}
                </div>
              </div>
              <div className="participant-status">
                {participant.hasCamera ? 
                  <FaVideo className="status-icon" /> : 
                  <FaVideoSlash className="status-icon disabled" />
                }
                {participant.hasMicrophone ? 
                  <FaMicrophone className="status-icon" /> : 
                  <FaMicrophoneSlash className="status-icon disabled" />
                }
                {participant.isScreenSharing && 
                  <FaDesktop className="status-icon sharing" />
                }
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .participants-list {
          display: flex;
          flex-direction: column;
          width: 300px;
          height: 100%;
          background-color: #f8f9fa;
          border-left: 1px solid #dee2e6;
        }
        
        .participants-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #f1f3f5;
          border-bottom: 1px solid #dee2e6;
        }
        
        .participants-header h5 {
          margin: 0;
          font-size: 16px;
        }
        
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
        }
        
        .participants-container {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        
        .no-participants {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #6c757d;
          font-style: italic;
        }
        
        .participant-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 5px;
          background-color: #ffffff;
          border: 1px solid #e9ecef;
        }
        
        .participant-item.current-user {
          background-color: #e9f5ff;
        }
        
        .participant-avatar {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          margin-right: 10px;
        }
        
        .participant-info {
          flex: 1;
        }
        
        .participant-name {
          font-weight: 500;
        }
        
        .participant-status {
          display: flex;
          gap: 8px;
        }
        
        .status-icon {
          color: #198754;
          font-size: 14px;
        }
        
        .status-icon.disabled {
          color: #dc3545;
        }
        
        .status-icon.sharing {
          color: #0d6efd;
        }
      `}</style>
    </div>
  );
};

export default ParticipantsList;