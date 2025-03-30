import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import {
  MeetingMessage,
  MeetingParticipant,
} from "../../app/api/meeting/meeting"; // Import MeetingParticipant
import { format } from "date-fns";

interface MeetingChatProps {
  messages: MeetingMessage[];
  sendMessage: (
    message: string,
    isPrivate?: boolean,
    receiverId?: string
  ) => void;
  participants: MeetingParticipant[]; // Fix type from string[] to MeetingParticipant[]
  currentUserId: string;
  onClose: () => void;
}

const MeetingChat: React.FC<MeetingChatProps> = ({
  messages,
  sendMessage,
  participants,
  currentUserId,
  onClose,
}) => {
  const [messageText, setMessageText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(
        messageText,
        isPrivate,
        isPrivate ? selectedReceiverId : undefined
      );
      setMessageText("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm");
  };

  const getParticipantName = (userId: string) => {
    const participant = participants.find((p) => p.userId === userId);
    return participant?.user?.username || "Unknown User";
  };

  return (
    <div className="meeting-chat">
      <div className="chat-header">
        <h5>Meeting Chat</h5>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.senderId === currentUserId ? "sent" : "received"
              } ${message.isPrivate ? "private" : ""}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {message.senderId === currentUserId
                    ? "You"
                    : getParticipantName(message.senderId)}
                </span>
                {message.isPrivate && (
                  <span className="private-badge">
                    Private to{" "}
                    {message.receiverId === currentUserId
                      ? "you"
                      : getParticipantName(message.receiverId || "")}
                  </span>
                )}
                <span className="timestamp">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div className="message-content">{message.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <div className="message-options">
          <label className="private-checkbox">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            Private message
          </label>

          {isPrivate && (
            <select
              value={selectedReceiverId}
              onChange={(e) => setSelectedReceiverId(e.target.value)}
              required
              className="receiver-select"
            >
              <option value="">Select recipient</option>
              {participants
                .filter((p) => p.userId !== currentUserId && p.isActive) // Use userId instead of assuming p is string
                .map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.user?.username || "Unknown User"}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!messageText.trim() || (isPrivate && !selectedReceiverId)}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>

      <style jsx>{`
        .meeting-chat {
          display: flex;
          flex-direction: column;
          width: 300px;
          height: 100%;
          background-color: #f8f9fa;
          border-left: 1px solid #dee2e6;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #f1f3f5;
          border-bottom: 1px solid #dee2e6;
        }

        .chat-header h5 {
          margin: 0;
          font-size: 16px;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }

        .no-messages {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #6c757d;
          font-style: italic;
        }

        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
          max-width: 85%;
        }

        .message.sent {
          background-color: #d1e7ff;
          margin-left: auto;
        }

        .message.received {
          background-color: #e9ecef;
          margin-right: auto;
        }

        .message.private {
          background-color: #ffe8d9;
        }

        .message-header {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .sender-name {
          font-weight: bold;
          margin-right: 8px;
        }

        .private-badge {
          background-color: #fd7e14;
          color: white;
          padding: 1px 5px;
          border-radius: 10px;
          font-size: 10px;
          margin-right: 8px;
        }

        .timestamp {
          color: #6c757d;
          margin-left: auto;
        }

        .message-content {
          word-break: break-word;
        }

        .message-form {
          padding: 10px;
          border-top: 1px solid #dee2e6;
        }

        .message-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }

        .private-checkbox {
          display: flex;
          align-items: center;
          font-size: 14px;
          cursor: pointer;
        }

        .private-checkbox input {
          margin-right: 5px;
        }

        .receiver-select {
          flex: 1;
          padding: 5px;
          border-radius: 4px;
          border: 1px solid #ced4da;
        }

        .input-container {
          display: flex;
        }

        .message-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px 0 0 4px;
          outline: none;
        }

        .send-btn {
          background-color: #0d6efd;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          padding: 8px 12px;
          cursor: pointer;
        }

        .send-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MeetingChat;
