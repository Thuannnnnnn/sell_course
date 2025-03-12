"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow, addHours } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Discussion, CreateDiscussionDto } from "@/app/type/forum/forum";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import {
  createDiscussion,
  deleteDiscussion,
  updateDiscussion,
} from "@/app/api/discussion/Discussion";
import { io, Socket } from "socket.io-client";
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
  const [socket, setSocket] = useState<Socket | null>(null);

  // WebSocket setup
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
      {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token: session?.user?.token },
      }
    );
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server for discussions");
      socketInstance.emit("joinForumRoom", forumId);
    });

    socketInstance.on(
      "discussionUpdated",
      (updatedDiscussions: Discussion[]) => {
        console.log("Received updated discussions:", updatedDiscussions);
        onDiscussionsChange(updatedDiscussions);
      }
    );

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socketInstance.emit("leaveForumRoom", forumId);
      socketInstance.off("connect");
      socketInstance.off("discussionUpdated");
      socketInstance.off("disconnect");
      socketInstance.disconnect();
    };
  }, [forumId, session?.user?.token, onDiscussionsChange]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !comment.trim()) return;

    const createDiscussionDto: CreateDiscussionDto = {
      userId: session.user.user_id,
      forumId,
      content: comment.trim(),
    };

    try {
      const newDiscussion = await createDiscussion(
        createDiscussionDto,
        session.user.token
      );
      if (newDiscussion) {
        const updatedDiscussions = [...discussions, newDiscussion];
        onDiscussionsChange(updatedDiscussions);
        socket?.emit("updateDiscussions", {
          forumId,
          discussions: updatedDiscussions,
        });
        setComment("");
      }
    } catch (error) {
      console.error("Error creating discussion:", error);
      alert(t("createCommentError"));
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!session?.user?.token) return;

    const confirmDelete = window.confirm(t("confirmDeleteComment"));
    if (!confirmDelete) return;

    console.log("Attempting to delete discussion with ID:", discussionId);

    try {
      const success = await deleteDiscussion(
        discussionId,
        session.user.token,
        session.user.user_id
      );

      console.log("Delete API response:", success);

      if (success) {
        const updatedDiscussions = discussions.filter(
          (d) => d.discussionId !== discussionId
        );
        onDiscussionsChange(updatedDiscussions);
        socket?.emit("updateDiscussions", {
          forumId,
          discussions: updatedDiscussions,
        });
      } else {
        alert(t("deleteFailed"));
        console.warn("Delete request returned false");
      }
    } catch {
      alert(t("deleteError"));
    }
  };

  const startEditingDiscussion = (discussion: Discussion) => {
    setEditingDiscussion(discussion.discussionId);
    setEditContent(discussion.content || "");
  };

  const cancelEditingDiscussion = () => {
    setEditingDiscussion(null);
    setEditContent("");
  };

  const saveEditedDiscussion = async (discussionId: string) => {
    if (!session?.user?.token || !editContent.trim()) return;

    const updateDto = { content: editContent.trim() };

    try {
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
        socket?.emit("updateDiscussions", {
          forumId,
          discussions: updatedDiscussions,
        });
        setEditingDiscussion(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Error updating discussion:", error);
      alert(t("updateCommentError"));
    }
  };

  const dateLocale = locale === "vi" ? vi : enUS;

  return (
    <div className="card shadow-sm mb-4">
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
              disabled={!session}
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
                    {discussion.user && discussion.user.avatarImg ? (
                      <Image
                        src={discussion.user.avatarImg}
                        alt={discussion.user.username || "User"}
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
                        {discussion.user?.username?.charAt(0).toUpperCase() ||
                          "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold mb-1">
                        {discussion.user?.username || "Unknown User"}
                      </div>
                      {session?.user?.user_id &&
                        discussion.user?.user_id &&
                        session.user.user_id === discussion.user.user_id && (
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
                          title={t("edit")}
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
                        {discussion.content || "No content available"}
                      </div>
                    )}
                    <div className="text-muted small">
                      {discussion.createdAt
                        ? formatDistanceToNow(
                            addHours(new Date(discussion.createdAt), 7),
                            {
                              addSuffix: true,
                              locale: dateLocale,
                            }
                          )
                        : "Unknown time"}
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
