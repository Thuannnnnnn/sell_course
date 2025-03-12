"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { formatDistanceToNow, format, addHours } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ForumReactions from "./ForumReactions";
import ForumDiscussions from "./ForumDiscussions";
import { useTranslations } from "next-intl";
import { Forum, Discussion, Reaction } from "@/app/type/forum/forum";
import { getForumById, deleteForum } from "@/app/api/forum/forum";
import { getDiscussionsByForumId } from "@/app/api/discussion/Discussion";
import { getReactionsByTopic } from "@/app/api/forum/forum";
import { io, Socket } from "socket.io-client";

const ForumDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const forumId = params.forumId as string;
  const { data: session } = useSession();
  const t = useTranslations("Forum");
  const [forum, setForum] = useState<Forum | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Đồng bộ reactions
  const syncReactions = useCallback(async () => {
    if (!session?.user?.token || !forumId) return;
    try {
      const result = await getReactionsByTopic(session.user.token, forumId);
      if (result.success && Array.isArray(result.data)) {
        setForum((prev) =>
          prev ? { ...prev, reactionTopics: result.data } : null
        );
      }
    } catch {
      console.log("error");
    }
  }, [forumId, session?.user?.token]);

  // Đồng bộ discussions
  const syncDiscussions = useCallback(async () => {
    if (!session?.user?.token || !forumId) return;
    try {
      const discussionData = await getDiscussionsByForumId(
        forumId,
        session.user.token
      );
      if (discussionData) {
        setDiscussions(discussionData);
      }
    } catch {
      console.log("error");
    }
  }, [forumId, session?.user?.token]);

  useEffect(() => {
    if (!session?.user?.token) return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
      {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token: session.user.token },
      }
    );
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      socketInstance.emit("joinForumRoom", forumId);
    });

    socketInstance.on(
      "discussionUpdated",
      (updatedDiscussions: Discussion[]) => {
        setDiscussions(updatedDiscussions);
      }
    );

    socketInstance.on(
      "forumReactionsUpdated",
      (data: { forumId: string; reactions: Reaction[] }) => {
        if (data.forumId === forumId) {
          setForum((prev) =>
            prev ? { ...prev, reactionTopics: data.reactions } : null
          );
        }
      }
    );

    socketInstance.on("forumDeleted", (deletedForumId: string) => {
      if (deletedForumId === forumId) {
        router.push(`/${locale}/forum`);
      }
    });

    socketInstance.on("disconnect", () => {
      // Disconnect handling
    });

    return () => {
      socketInstance.emit("leaveForumRoom", forumId);
      socketInstance.disconnect();
    };
  }, [forumId, session?.user?.token, locale, router]);

  // Lấy dữ liệu ban đầu
  const fetchForumDetail = useCallback(async () => {
    try {
      setLoading(true);
      if (!forumId) throw new Error("No forumId provided");
      const forumData = await getForumById(forumId);
      if (!forumData) throw new Error("Forum not found");
      setForum({
        ...forumData,
        reactionTopics: forumData.reactionTopics || [],
      });
      setError(null);
    } catch {
      setError(t("postNotFound"));
    } finally {
      setLoading(false);
    }
  }, [forumId, t]);

  useEffect(() => {
    fetchForumDetail();
    syncDiscussions();
    syncReactions();
  }, [fetchForumDetail, syncDiscussions, syncReactions]);

  const handleDeleteForum = async () => {
    if (!session?.user?.token || !forumId) return;

    const confirmDelete = window.confirm(t("confirmDeleteForum"));
    if (!confirmDelete) return;

    try {
      const success = await deleteForum(forumId, session.user.token);
      if (success) {
        socket?.emit("deleteForum", forumId);
      } else {
        alert(t("deleteFailed"));
      }
    } catch {
      alert(t("deleteError"));
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-8">
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("loading")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !forum) {
    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-8">
            <div className="alert alert-danger" role="alert">
              {error || t("postNotFound")}
              <div className="mt-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => router.push(`/${locale}/forum`)}
                >
                  {t("backToForum")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dateLocale = locale === "vi" ? vi : enUS;
  const formattedDate = formatDistanceToNow(
    addHours(new Date(forum.createdAt), 7),
    {
      addSuffix: true,
      locale: dateLocale,
    }
  );
  const exactDate = format(new Date(forum.createdAt), "dd/MM/yyyy HH:mm");

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link
                  href={`/${locale}/forum`}
                  className="text-decoration-none"
                >
                  {t("title")}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {forum.title}
              </li>
            </ol>
          </nav>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {forum.user.avatarImg ? (
                    <Image
                      src={forum.user.avatarImg}
                      alt={forum.user.username}
                      width={48}
                      height={48}
                      className="rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                      style={{ width: "48px", height: "48px" }}
                    >
                      {forum.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{forum.user.username}</h6>
                  <small className="text-muted" title={exactDate}>
                    {formattedDate}
                  </small>
                </div>
              </div>
            </div>
            <div className="card-body">
              <h4 className="card-title mb-3">{forum.title}</h4>
              {forum.image && (
                <div className="forum-image mb-4">
                  <div
                    className="rounded"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "500px",
                    }}
                  >
                    <Image
                      src={forum.image}
                      alt={forum.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}
              <div className="forum-content mb-4">
                <p className="card-text" style={{ whiteSpace: "pre-line" }}>
                  {forum.text}
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <ForumReactions
                    forumId={forumId}
                    reactions={forum.reactionTopics}
                    onReactionChange={(newReactions) => {
                      setForum((prev) =>
                        prev ? { ...prev, reactionTopics: newReactions } : null
                      );
                    }}
                  />
                  {session?.user?.user_id === forum.user.user_id && (
                    <>
                      <Link
                        href={`/${locale}/forum/edit/${forumId}`}
                        className="btn btn-outline-secondary me-2"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        {t("editPost")}
                      </Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleDeleteForum}
                      >
                        <i className="bi bi-trash me-1"></i>
                        {t("deletePost")}
                      </button>
                    </>
                  )}
                </div>
                <div className="text-muted small">
                  <i className="bi bi-chat-left-text me-1"></i>
                  {discussions.length} {t("comments")}
                </div>
              </div>
            </div>
          </div>
          <ForumDiscussions
            forumId={forumId}
            locale={locale}
            discussions={discussions}
            onDiscussionsChange={(newDiscussions) => {
              setDiscussions(newDiscussions);
            }}
          />
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t("author")}</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                {forum.user.avatarImg ? (
                  <Image
                    src={forum.user.avatarImg}
                    alt={forum.user.username}
                    width={64}
                    height={64}
                    className="rounded-circle me-3"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white me-3"
                    style={{ width: "64px", height: "64px" }}
                  >
                    {forum.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h6 className="mb-1">{forum.user.username}</h6>
                  <p className="text-muted small mb-0">
                    {t("joinedOn")}:{" "}
                    {format(new Date(forum.user.createdAt), "MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t("postStats")}</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t("postedOn")}</span>
                  <span>{format(new Date(forum.createdAt), "dd/MM/yyyy")}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t("likes")}</span>
                  <span className="badge bg-primary rounded-pill">
                    {forum.reactionTopics?.length || 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t("comments")}</span>
                  <span className="badge bg-primary rounded-pill">
                    {discussions.length}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="d-grid gap-2">
            <Link href={`/${locale}/forum`} className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              {t("backToForum")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
