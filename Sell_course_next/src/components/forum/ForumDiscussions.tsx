"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Discussion, CreateDiscussionDto } from "@/app/type/forum/forum";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import {
  createDiscussion,
  deleteDiscussion,
  updateDiscussion,
  getDiscussionsByForumId,
} from "@/app/api/discussion/Discussion";

interface ForumDiscussionsProps {
  forumId: string;
  locale: string;
  discussions: Discussion[];
  onDiscussionsChange: (discussions: Discussion[]) => void;
}

const ForumDiscussions: React.FC<ForumDiscussionsProps> = ({
  forumId,
  locale,
  discussions,
  onDiscussionsChange,
}) => {
  const { data: session } = useSession();
  const t = useTranslations("Forum");
  const [comment, setComment] = useState<string>("");
  const [editingDiscussion, setEditingDiscussion] = useState<string | null>(
    null
  );
  const [editContent, setEditContent] = useState<string>("");
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const [isCurrentlyPolling, setIsCurrentlyPolling] = useState<boolean>(false);

  const fetchDiscussions = useCallback(async () => {
    if (!session?.user?.token || !forumId) return;
    try {
      const discussionData = await getDiscussionsByForumId(
        forumId,
        session.user.token
      );
      onDiscussionsChange(discussionData ?? []);
    } catch {
      onDiscussionsChange([]);
    }
  }, [forumId, session?.user?.token, onDiscussionsChange]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !comment.trim()) return;

    const createDiscussionDto: CreateDiscussionDto = {
      userId: session.user.user_id,
      forumId,
      content: comment.trim(),
    };

    const newDiscussion = await createDiscussion(
      createDiscussionDto,
      session.user.token
    );
    if (newDiscussion) {
      const updatedDiscussions = [...discussions, newDiscussion];
      onDiscussionsChange(updatedDiscussions);
      setComment("");
      window.dispatchEvent(
        new CustomEvent("forumDiscussionChanged", { detail: { forumId } })
      );
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!session?.user?.token) return;
    const success = await deleteDiscussion(
      discussionId,
      session.user.token,
      session.user.user_id
    );
    if (success) {
      const updatedDiscussions = discussions.filter(
        (d) => d.discussionId !== discussionId
      );
      onDiscussionsChange(updatedDiscussions);
      window.dispatchEvent(
        new CustomEvent("forumDiscussionChanged", { detail: { forumId } })
      );
    }
  };

  const startEditingDiscussion = (discussion: Discussion) => {
    setEditingDiscussion(discussion.discussionId);
    setEditContent(discussion.content);
  };

  const cancelEditingDiscussion = () => {
    setEditingDiscussion(null);
    setEditContent("");
  };

  const saveEditedDiscussion = async (discussionId: string) => {
    if (!session?.user?.token || !editContent.trim()) return;

    const updateDto = {
      content: editContent.trim(),
    };

    const updatedDiscussion = await updateDiscussion(
      discussionId,
      updateDto,
      session.user.token,
      session.user.user_id
    );

    if (updatedDiscussion) {
      const updatedDiscussions = discussions.map((d) =>
        d.discussionId === discussionId
          ? { ...d, content: editContent.trim() }
          : d
      );
      onDiscussionsChange(updatedDiscussions);
      setEditingDiscussion(null);
      setEditContent("");
      window.dispatchEvent(
        new CustomEvent("forumDiscussionChanged", { detail: { forumId } })
      );
    }
  };

  useEffect(() => {
    const handleUserInteraction = () => setPollingActive(true);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (!pollingActive) return;

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        setIsCurrentlyPolling(true);
        fetchDiscussions().finally(() => setIsCurrentlyPolling(false));
      }
    }, 3000);

    const timeoutId = setTimeout(() => setPollingActive(false), 2 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [pollingActive, forumId, fetchDiscussions]);

  useEffect(() => {
    const handleDiscussionChange = (event: CustomEvent) => {
      if (event.detail.forumId === forumId) {
        fetchDiscussions();
      }
    };
    window.addEventListener(
      "forumDiscussionChanged",
      handleDiscussionChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "forumDiscussionChanged",
        handleDiscussionChange as EventListener
      );
  }, [forumId, fetchDiscussions]);

  const dateLocale = locale === "vi" ? vi : enUS;

  return (
    <div className="card shadow-sm mb-4">
      {pollingActive && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1050 }}
        >
          <div
            className={`toast ${isCurrentlyPolling ? "show" : ""}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <div
                className={`spinner-border spinner-border-sm me-2 ${
                  isCurrentlyPolling ? "" : "invisible"
                }`}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <strong className="me-auto">Real-time Updates</strong>
              <small>{new Date().toLocaleTimeString()}</small>
            </div>
            <div className="toast-body">
              {isCurrentlyPolling
                ? "Đang cập nhật bình luận..."
                : "Đang theo dõi thay đổi trong thời gian thực"}
            </div>
          </div>
        </div>
      )}
      <div className="card-header bg-white">
        <h5 className="mb-0">
          {t("comments")} ({discussions.length})
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <div className="mb-3">
            <textarea
              className="form-control"
              rows={3}
              placeholder={t("writeComment")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!session}>
            {t("sendComment")}
          </button>
        </form>
        {discussions.length > 0 ? (
          <div className="comments-list">
            {discussions.map((discussion) => (
              <div
                key={discussion.discussionId}
                className="comment mb-3 pb-3 border-bottom"
              >
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    {discussion.user.avatarImg ? (
                      <Image
                        src={discussion.user.avatarImg}
                        alt={discussion.user.username}
                        width={40}
                        height={40}
                        className="rounded-circle"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{ width: "40px", height: "40px" }}
                      >
                        {discussion.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold mb-1">
                        {discussion.user.username}
                      </div>
                      {session?.user?.user_id === discussion.user.user_id && (
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEditingDiscussion(discussion)}
                            title={t("edit")}
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDeleteDiscussion(discussion.discussionId)
                            }
                            title={t("delete")}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingDiscussion === discussion.discussionId ? (
                      <div className="mb-2">
                        <textarea
                          className="form-control mb-2"
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          required
                        />
                        <div className="d-flex justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={cancelEditingDiscussion}
                          >
                            {t("cancel")}
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              saveEditedDiscussion(discussion.discussionId)
                            }
                          >
                            {t("save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="comment-content mb-1">
                        {discussion.content}
                      </div>
                    )}
                    <div className="text-muted small">
                      {formatDistanceToNow(new Date(discussion.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted mb-0">{t("noComments")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumDiscussions;
