"use client";

import React, { useEffect, useState } from "react";
import { Forum, getForumById } from "@/app/api/forum/forum";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DeleteForumButton from "./DeleteForumButton";
import { useTranslations } from "next-intl";

const ForumDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const forumId = params.forumId as string;
  const { data: session } = useSession();
  const t = useTranslations("Forum");

  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");

  const isAuthor = session?.user?.user_id === forum?.user.user_id;

  useEffect(() => {
    const fetchForumDetail = async () => {
      try {
        setLoading(true);
        console.log("Fetching forum with ID:", forumId);
        const forumData = await getForumById(forumId);

        console.log("Forum data received:", forumData);

        if (!forumData) {
          console.error("Forum data is null or undefined");
          setError(t("postNotFound"));
          return;
        }

        setForum(forumData);
        setError(null);
      } catch (err) {
        console.error("Error fetching forum detail:", err);
        setError(t("errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    if (forumId) {
      fetchForumDetail();
    } else {
      console.error("Forum ID is missing");
      setError(t("postNotFound"));
      setLoading(false);
    }
  }, [forumId, t]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Comment submitted:", comment);
    setComment("");
  };

  const handleReaction = () => {
    console.log("Reaction added");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <div className="mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => router.push(`/${locale}/forum`)}
          >
            {t("backToForum")}
          </button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="text-center my-5">
        <p className="fs-5">{t("postNotFound")}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => router.push(`/${locale}/forum`)}
        >
          {t("backToForum")}
        </button>
      </div>
    );
  }

  const dateLocale = locale === "vi" ? vi : enUS;

  const formattedDate = formatDistanceToNow(new Date(forum.createdAt), {
    addSuffix: true,
    locale: dateLocale,
  });

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
                  <img
                    src={forum.image}
                    alt={forum.title}
                    className="img-fluid rounded"
                    style={{
                      maxHeight: "500px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}

              <div className="forum-content mb-4">
                <p className="card-text" style={{ whiteSpace: "pre-line" }}>
                  {forum.text}
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={handleReaction}
                  >
                    <i className="bi bi-hand-thumbs-up me-1"></i>
                    {t("likes")} ({forum.reactionTopics.length})
                  </button>

                  {isAuthor && (
                    <>
                      <Link
                        href={`/${locale}/forum/edit/${forumId}`}
                        className="btn btn-outline-secondary me-2"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        {t("editPost")}
                      </Link>

                      <DeleteForumButton
                        forumId={forumId}
                        userId={forum.user.user_id}
                        locale={locale}
                      />
                    </>
                  )}
                </div>
                <div className="text-muted small">
                  <i className="bi bi-chat-left-text me-1"></i>
                  {forum.discussions.length} {t("comments")}
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {t("comments")} ({forum.discussions.length})
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
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  {t("sendComment")}
                </button>
              </form>

              {forum.discussions.length > 0 ? (
                <div className="comments-list">
                  {forum.discussions.map((discussion) => (
                    <div
                      key={discussion.discussionId}
                      className="comment mb-3 pb-3 border-bottom"
                    >
                      <div className="d-flex">
                        <div className="me-3">
                          <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                            style={{ width: "40px", height: "40px" }}
                          >
                            U
                          </div>
                        </div>
                        <div>
                          <div className="fw-bold mb-1">{t("author")}</div>
                          <div className="comment-content mb-1">
                            {discussion.content}
                          </div>
                          <div className="text-muted small">
                            {formatDistanceToNow(
                              new Date(discussion.createdAt),
                              {
                                addSuffix: true,
                                locale: dateLocale,
                              }
                            )}
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
                    {forum.reactionTopics.length}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t("comments")}</span>
                  <span className="badge bg-primary rounded-pill">
                    {forum.discussions.length}
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
