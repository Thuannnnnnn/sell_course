"use client";
import { useQaSocket } from "@/hook/useQaSocket";
import { useState, useEffect } from "react";
import {
  createQa,
  updatesQa,
  deleteQa,
  createReaction,
  deleteReaction,
} from "@/app/api/QAStudy/qastudy";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  FaEdit,
  FaTrash,
  FaReply,
  FaThumbsUp,
  FaHeart,
  FaLaugh,
  FaSurprise,
  FaSadTear,
  FaAngry,
  FaAngleDown,
} from "react-icons/fa";
import styles from "../../style/QaStudy.module.css";

type QaStudyListProps = {
  courseId: string;
};

export default function QaStudyList({ courseId }: QaStudyListProps) {
  const { qaList } = useQaSocket(courseId);
  const [question, setQuestion] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingQaId, setEditingQaId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [hoveringReactionId, setHoveringReactionId] = useState<string | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;
  const { data: session } = useSession();

  const sortedQas = [...qaList]
    .filter((qa) => !qa.parentId)
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  // Calculate total pages
  const totalPages = Math.ceil(sortedQas.length / commentsPerPage);

  // Get current page comments
  const currentComments = sortedQas.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {};
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const sendQuestion = async () => {
    if (!question || !session?.user.email || !session?.user.token) return;

    try {
      await createQa(
        session.user.email,
        courseId,
        question,
        replyToId || "",
        session.user.token
      );
      setQuestion("");
      setReplyToId(null);
    } catch (error) {
      console.error("Failed to create QA:", error);
    }
  };

  const sendReply = async () => {
    if (
      !replyText ||
      !session?.user.email ||
      !session?.user.token ||
      !replyToId
    )
      return;

    try {
      await createQa(
        session.user.email,
        courseId,
        replyText,
        replyToId,
        session.user.token
      );
      setReplyText("");
      setReplyToId(null);
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const handleEdit = (qaId: string, currentText: string) => {
    setEditingQaId(qaId);
    setEditText(currentText);
  };

  const saveEdit = async (qaId: string) => {
    if (!editText || !session?.user.token) return;

    try {
      await updatesQa(qaId, courseId, editText, session.user.token);
      setEditingQaId(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update QA:", error);
    }
  };

  const handleDelete = async (qaId: string) => {
    if (!session?.user.token) return;

    try {
      await deleteQa(qaId, session.user.token);
    } catch (error) {
      console.error("Failed to delete QA:", error);
    }
  };

  const handleReply = (qaId: string) => {
    setReplyToId(qaId);
    setReplyText("");
  };

  const handleReaction = async (
    qaId: string,
    reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  ) => {
    if (!session?.user.user_id || !session?.user.token) return;

    const userReaction = qaList
      .find((qa) => qa.qaId === qaId)
      ?.reactionQas?.find((r) => r.userEmail === session.user.email);

    try {
      if (userReaction) {
        if (userReaction.reactionType === reactionType) {
          // If the user clicks the same reaction, remove it
          await deleteReaction(
            session.user.user_id,
            qaId,
            courseId,
            session.user.token
          );
        } else {
          await createReaction(
            session.user.user_id,
            qaId,
            reactionType,
            courseId,
            session.user.token
          );
        }
      } else {
        await createReaction(
          session.user.user_id,
          qaId,
          reactionType,
          courseId,
          session.user.token
        );
      }
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const getReactionCount = (qaId: string, reactionType: string) =>
    qaList
      .find((qa) => qa.qaId === qaId)
      ?.reactionQas?.filter((r) => r.reactionType === reactionType).length || 0;

  const hasUserReacted = (qaId: string, reactionType: string) =>
    qaList
      .find((qa) => qa.qaId === qaId)
      ?.reactionQas?.some(
        (r) =>
          r.userEmail === session?.user.email && r.reactionType === reactionType
      );

  const getUserReaction = (qaId: string) => {
    const qa = qaList.find((qa) => qa.qaId === qaId);
    const userReaction = qa?.reactionQas?.find(
      (r) => r.userEmail === session?.user.email
    );
    return userReaction?.reactionType || null;
  };

  const getReactionIcon = (reactionType: string) => {
    switch (reactionType) {
      case "like":
        return <FaThumbsUp />;
      case "love":
        return <FaHeart />;
      case "haha":
        return <FaLaugh />;
      case "wow":
        return <FaSurprise />;
      case "sad":
        return <FaSadTear />;
      case "angry":
        return <FaAngry />;
      default:
        return <FaThumbsUp />;
    }
  };

  const getReactionClass = (reactionType: string) => {
    switch (reactionType) {
      case "like":
        return styles.active;
      case "love":
        return `${styles.active} ${styles.love}`;
      case "haha":
        return `${styles.active} ${styles.haha}`;
      case "wow":
        return `${styles.active} ${styles.wow}`;
      case "sad":
        return `${styles.active} ${styles.sad}`;
      case "angry":
        return `${styles.active} ${styles.angry}`;
      default:
        return "";
    }
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  const renderReactionButtons = (qaId: string) => {
    const userReaction = getUserReaction(qaId);
    const isHovering = hoveringReactionId === qaId;
    const totalReactions =
      getReactionCount(qaId, "like") +
      getReactionCount(qaId, "love") +
      getReactionCount(qaId, "haha") +
      getReactionCount(qaId, "wow") +
      getReactionCount(qaId, "sad") +
      getReactionCount(qaId, "angry");

    return (
      <div
        className={styles.reactionPanel}
        onMouseEnter={() => setHoveringReactionId(qaId)}
        onMouseLeave={() => setHoveringReactionId(null)}
      >
        {/* Show only the user's reaction or like button by default */}
        {!isHovering && (
          <button
            onClick={() => handleReaction(qaId, userReaction || "like")}
            className={`${styles.reactionButton} ${
              userReaction ? getReactionClass(userReaction) : ""
            }`}
          >
            {userReaction ? getReactionIcon(userReaction) : <FaThumbsUp />}
            {totalReactions > 0 && (
              <span className={styles.reactionCount}>{totalReactions}</span>
            )}
          </button>
        )}

        {/* Show all reaction options on hover */}
        {isHovering && (
          <div className={styles.reactionPanel}>
            <button
              onClick={() => handleReaction(qaId, "like")}
              className={`${styles.reactionButton} ${
                hasUserReacted(qaId, "like") ? styles.active : ""
              }`}
              title="Like"
            >
              <FaThumbsUp />
              {getReactionCount(qaId, "like") > 0 && (
                <span className={styles.reactionCount}>
                  {getReactionCount(qaId, "like")}
                </span>
              )}
            </button>
            <button
              onClick={() => handleReaction(qaId, "love")}
              className={`${styles.reactionButton} ${
                hasUserReacted(qaId, "love")
                  ? `${styles.active} ${styles.love}`
                  : ""
              }`}
              title="Love"
            >
              <FaHeart />
              {getReactionCount(qaId, "love") > 0 && (
                <span className={styles.reactionCount}>
                  {getReactionCount(qaId, "love")}
                </span>
              )}
            </button>
            <button
              onClick={() => handleReaction(qaId, "haha")}
              className={`${styles.reactionButton} ${
                hasUserReacted(qaId, "haha")
                  ? `${styles.active} ${styles.haha}`
                  : ""
              }`}
              title="Haha"
            >
              <FaLaugh />
              {getReactionCount(qaId, "haha") > 0 && (
                <span className={styles.reactionCount}>
                  {getReactionCount(qaId, "haha")}
                </span>
              )}
            </button>
            <button
              onClick={() => handleReaction(qaId, "wow")}
              className={`${styles.reactionButton} ${
                hasUserReacted(qaId, "wow")
                  ? `${styles.active} ${styles.wow}`
                  : ""
              }`}
              title="Wow"
            >
              <FaSurprise />
              {getReactionCount(qaId, "wow") > 0 && (
                <span className={styles.reactionCount}>
                  {getReactionCount(qaId, "wow")}
                </span>
              )}
            </button>
            <button
              onClick={() => handleReaction(qaId, "sad")}
              className={`${styles.reactionButton} ${
                hasUserReacted(qaId, "sad")
                  ? `${styles.active} ${styles.sad}`
                  : ""
              }`}
              title="Sad"
            >
              <FaSadTear />
              {getReactionCount(qaId, "sad") > 0 && (
                <span className={styles.reactionCount}>
                  {getReactionCount(qaId, "sad")}
                </span>
              )}
            </button>
            <button
              onClick={() => handleReaction(qaId, "angry")}
              className={`${styles.reactionButton} ${
                hasUserReacted(qaId, "angry")
                  ? `${styles.active} ${styles.angry}`
                  : ""
              }`}
              title="Angry"
            >
              <FaAngry />
              {getReactionCount(qaId, "angry") > 0 && (
                <span className={styles.reactionCount}>
                  {getReactionCount(qaId, "angry")}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const getReplies = (qaId: string) =>
    qaList.filter((qa) => qa.parentId === qaId);

  return (
    <div className={styles.container}>
      {/* Comment input area */}
      <div className={styles.commentInput}>
        <div className={styles.inputArea}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Add comment..."
            className={styles.textInput}
            onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
          />
        </div>
        <div className={styles.formatToolbar}>
          <button
            onClick={sendQuestion}
            className={styles.submitButton}
            type="button"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Comments header */}
      <div className={styles.commentsHeader}>
        <div className={styles.commentsTitle}>
          Comments{" "}
          <span className={styles.commentCount}>{sortedQas.length}</span>
        </div>
        <div className={styles.sortOptions} onClick={handleSortChange}>
          {sortOrder === "newest" ? "Most recent" : "Oldest first"}{" "}
          <FaAngleDown className={styles.sortIcon} />
        </div>
      </div>

      {/* Comments list */}
      <div>
        {currentComments.map((qa) => (
          <div key={qa.qaId} className={styles.commentItem}>
            <div className={styles.avatar}>
              <Image
                src={qa.avatarImg || "/default-avatar.png"}
                alt={qa.username}
                width={40}
                height={40}
              />
            </div>
            <div className={styles.commentContent}>
              <div className={styles.commentHeader}>
                <span className={styles.userName}>{qa.username}</span>
                <span className={styles.timeAgo}>
                  {new Date(
                    new Date(qa.createdAt).setHours(
                      new Date(qa.createdAt).getHours() + 7
                    )
                  ).toLocaleString()}
                </span>
              </div>

              {editingQaId === qa.qaId ? (
                <div className={styles.editContainer}>
                  <textarea
                    title="edit"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={styles.editTextarea}
                  />
                  <div className={styles.editButtons}>
                    <button
                      onClick={() => saveEdit(qa.qaId)}
                      className={styles.saveButton}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingQaId(null)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.commentText}>{qa.text}</div>
              )}

              {/* Reaction Buttons */}
              {renderReactionButtons(qa.qaId)}

              {/* Comment actions */}
              <div className={styles.commentActions}>
                <div className={styles.actionGroup}>
                  <button
                    onClick={() => handleReply(qa.qaId)}
                    className={styles.actionButton}
                    title="Reply"
                  >
                    <FaReply className={styles.replyButton} /> Reply
                  </button>
                </div>

                {qa.userEmail === session?.user.email && (
                  <div className={styles.editDeleteGroup}>
                    <button
                      onClick={() => handleEdit(qa.qaId, qa.text)}
                      className={styles.actionButton}
                      title="Edit"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(qa.qaId)}
                      className={styles.actionButton}
                      title="Delete"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Reply input */}
              {replyToId === qa.qaId && (
                <div className={styles.replyInputContainer}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className={styles.replyTextarea}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendReply()
                    }
                  />
                  <div className={styles.replyButtons}>
                    <button
                      onClick={sendReply}
                      className={styles.replySubmitButton}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setReplyToId(null)}
                      className={styles.replyCancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              <div className={styles.replySection}>
                {getReplies(qa.qaId).map((reply) => (
                  <div key={reply.qaId} className={styles.replyItem}>
                    <div className={styles.replyAvatar}>
                      <Image
                        src={reply.avatarImg || "/default-avatar.png"}
                        alt={reply.username}
                        width={36}
                        height={36}
                      />
                    </div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.userName}>
                          {reply.username}
                          {reply.username === "Skill Sprout" && (
                            <span className={styles.verifiedBadge}>✓</span>
                          )}
                        </span>
                        <span className={styles.timeAgo}>
                          {new Date(
                            new Date(qa.createdAt).setHours(
                              new Date(qa.createdAt).getHours() + 7
                            )
                          ).toLocaleString()}
                        </span>
                      </div>

                      {editingQaId === reply.qaId ? (
                        <div className={styles.editContainer}>
                          <textarea
                            title="edit"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className={styles.editTextarea}
                          />
                          <div className={styles.editButtons}>
                            <button
                              onClick={() => saveEdit(reply.qaId)}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingQaId(null)}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.commentText}>{reply.text}</div>
                      )}

                      {/* Reaction Buttons for Replies */}
                      {renderReactionButtons(reply.qaId)}

                      {/* Reply actions */}
                      <div className={styles.commentActions}>
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => handleReply(reply.qaId)}
                            className={styles.actionButton}
                            title="Reply"
                          >
                            <FaReply /> Reply
                          </button>
                        </div>

                        {reply.userEmail === session?.user.email && (
                          <div className={styles.editDeleteGroup}>
                            <button
                              onClick={() => handleEdit(reply.qaId, reply.text)}
                              className={styles.actionButton}
                              title="Edit"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(reply.qaId)}
                              className={styles.actionButton}
                              title="Delete"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reply input for replies */}
                      {replyToId === reply.qaId && (
                        <div className={styles.replyInputContainer}>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className={styles.replyTextarea}
                            onKeyDown={(e) =>
                              e.key === "Enter" && !e.shiftKey && sendReply()
                            }
                          />
                          <div className={styles.replyButtons}>
                            <button
                              onClick={sendReply}
                              className={styles.replySubmitButton}
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => setReplyToId(null)}
                              className={styles.replyCancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageButton} ${
              currentPage === 1 ? styles.disabled : ""
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </div>

          <button
            className={`${styles.pageButton} ${
              currentPage === totalPages ? styles.disabled : ""
            }`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export type ReactionQa = {
  reactionId: string;
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
