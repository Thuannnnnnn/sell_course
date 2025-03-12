import React, { useState } from 'react';
import styles from '../../style/QaStudy.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export type ReactionQa = {
  userEmail: string;
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry";
};

export type QaData = {
  qaId: string;
  userEmail: string;
  username: string;
  courseId: string;
  text: string;
  parentId?: string | null;
  createdAt: string;
  avatarImg?: string;
  reactionQas?: ReactionQa[];
};

interface QaStudyProps {
  token: string;
  userEmail: string;
  courseId: string;
}

const QaStudy = ({ token, userEmail, courseId }: QaStudyProps) => {
  const qaList: QaData[] = [
    {
      qaId: "1",
      userEmail: "user1@example.com",
      username: "User1",
      courseId,
      text: "This is a sample question.",
      createdAt: "2023-10-01T10:00:00Z",
      avatarImg: "https://via.placeholder.com/40",
      reactionQas: [
        { userEmail: "user1@example.com", reactionType: "like" },
        { userEmail: "user2@example.com", reactionType: "love" },
      ],
    },
    {
      qaId: "2",
      userEmail: "user2@example.com",
      username: "Skill Sprout",
      courseId,
      text: "This is a reply.",
      parentId: "1",
      createdAt: "2023-10-01T10:05:00Z",
      avatarImg: "https://via.placeholder.com/40",
      reactionQas: [],
    },
  ];

  const QaStudyList = ({ qaList }: { qaList: QaData[] }) => {
    const renderQaWithReplies = (qa: QaData, level: number = 0) => {
      return (
        <div key={qa.qaId} style={{ marginLeft: `${level * 20}px` }}>
          <QaStudyItem qa={qa} />
          {qaList
            .filter((reply) => reply.parentId === qa.qaId)
            .map((reply) => renderQaWithReplies(reply, level + 1))}
        </div>
      );
    };

    return (
      <div className={styles.commentList}>
        {qaList
          .filter((qa) => !qa.parentId)
          .map((qa) => renderQaWithReplies(qa))}
      </div>
    );
  };

  const QaStudyItem = ({ qa }: { qa: QaData }) => {
    const isVerified = qa.username === 'Skill Sprout';
    const [isReactionPopupOpen, setIsReactionPopupOpen] = useState(false);
    const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState(qa.text);

    const getReactionCount = (type: ReactionQa["reactionType"]) => {
      return qa.reactionQas?.filter((r) => r.reactionType === type).length || 0;
    };

    const handleReactionClick = (type: ReactionQa["reactionType"]) => {
      console.log(`Selected reaction: ${type} for qaId: ${qa.qaId}`);
      setIsReactionPopupOpen(false); // Đóng popup sau khi chọn
    };

    const handleDelete = () => {
      if (confirm('Bạn có chắc chắn muốn xóa QA này?')) {
        console.log(`Deleted qaId: ${qa.qaId}`);
        // Thêm logic xóa thực tế nếu cần
      }
    };

    return (
      <div className={styles.comment}>
        <img
          src={qa.avatarImg || 'https://via.placeholder.com/40'}
          alt={`${qa.username}'s profile`}
          className={styles.avatar}
        />
        <div className={styles.commentContent}>
          <div className={styles.commentHeader}>
            <span className={styles.username}>
              {qa.username}
              {isVerified && <i className={`fas fa-check-circle ${styles.verifiedIcon}`}></i>}
            </span>
            <span className={styles.timestamp}>{qa.createdAt}</span>
            <div className={styles.actions}>
              <button className={styles.actionButton} onClick={() => setIsEditFormOpen(true)}>
                <i className="fas fa-edit"></i>
              </button>
              <button className={styles.actionButton} onClick={handleDelete}>
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p className={styles.commentText}>{qa.text}</p>
          <div className={styles.interactions}>
            <button
              className={styles.interactionButton}
              onClick={() => setIsReactionPopupOpen(true)}
            >
              <i className="fas fa-thumbs-up"></i> Like ({getReactionCount("like")})
            </button>
            <button className={styles.interactionButton} onClick={() => setIsReplyFormOpen(true)}>
              <i className="fas fa-reply"></i> Reply
            </button>
            <button className={styles.interactionButton}>
              <i className="fas fa-ellipsis-h"></i>
            </button>
            {isReactionPopupOpen && (
              <div className={styles.reactionPopup}>
                <button
                  className={styles.reactionPopupButton}
                  onClick={() => handleReactionClick("like")}
                >
                  <i className="fas fa-thumbs-up"></i>
                </button>
                <button
                  className={styles.reactionPopupButton}
                  onClick={() => handleReactionClick("love")}
                >
                  <i className="fas fa-heart"></i>
                </button>
                <button
                  className={styles.reactionPopupButton}
                  onClick={() => handleReactionClick("haha")}
                >
                  <i className="fas fa-laugh"></i>
                </button>
                <button
                  className={styles.reactionPopupButton}
                  onClick={() => handleReactionClick("wow")}
                >
                  <i className="fas fa-surprise"></i>
                </button>
                <button
                  className={styles.reactionPopupButton}
                  onClick={() => handleReactionClick("sad")}
                >
                  <i className="fas fa-sad-tear"></i>
                </button>
                <button
                  className={styles.reactionPopupButton}
                  onClick={() => handleReactionClick("angry")}
                >
                  <i className="fas fa-angry"></i>
                </button>
              </div>
            )}
          </div>
          {isReplyFormOpen && (
            <div className={styles.replyForm}>
              <textarea
                className={styles.replyInput}
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
              />
              <div className={styles.replyActions}>
                <button className={styles.submitButton}>Reply</button>
                <button className={styles.cancelButton} onClick={() => setIsReplyFormOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {isEditFormOpen && (
            <div className={styles.editForm}>
              <textarea
                className={styles.editInput}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
              />
              <div className={styles.editActions}>
                <button className={styles.submitButton}>Save</button>
                <button className={styles.cancelButton} onClick={() => setIsEditFormOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <form className={styles.inputForm}>
        <textarea
          className={styles.inputArea}
          placeholder="Add comment..."
          rows={2}
        />
        <div className={styles.toolbar}>
          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </div>
      </form>

      <div className={styles.commentsSection}>
        <div className={styles.commentsHeader}>
          <h3 className={styles.commentsTitle}>Comments</h3>
          <span className={styles.commentCount}>{qaList.length}</span>
          <div className={styles.sortContainer}>
            <span className={styles.sortIcon}>↑↓</span>
            <select className={styles.sortSelect}>
              <option value="most-recent">Most recent</option>
              <option value="most-liked">Most liked</option>
            </select>
          </div>
        </div>
        <QaStudyList qaList={qaList} />
      </div>
    </div>
  );
};

export default QaStudy;