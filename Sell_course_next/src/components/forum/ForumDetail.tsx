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
import ForumReactions from "./ForumReactions";
import { useTranslations } from "next-intl";

const ForumDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const forumId = params.forumId as string;
  const { data: session } = useSession();
  const t = useTranslations('Forum');

  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");

  // Check if current user is the author of the post
  const isAuthor = session?.user?.user_id === forum?.user.user_id;

  // Hàm để lấy dữ liệu forum - trả về Promise để có thể sử dụng .then()
  const fetchForumDetail = async (isPolling = false) => {
    try {
      if (!forumId) {
        console.error("Forum ID is missing");
        setError(t('postNotFound'));
        setLoading(false);
        return null;
      }

      // Chỉ hiển thị loading khi không phải đang polling
      if (!isPolling && !loading) setLoading(true);

      console.log("Fetching forum with ID:", forumId, isPolling ? "(polling)" : "");
      const forumData = await getForumById(forumId);

      console.log("Forum data received:", forumData);

      if (!forumData) {
        console.error("Forum data is null or undefined");
        setError(t('postNotFound'));
        return null;
      }

      // Nếu đang polling, log sự thay đổi trong reactions
      if (isPolling && forum) {
        const oldReactions = forum.reactionTopics || [];
        const newReactions = forumData.reactionTopics || [];

        if (oldReactions.length !== newReactions.length) {
          console.log("Reactions changed:", {
            before: oldReactions.length,
            after: newReactions.length,
            difference: newReactions.length - oldReactions.length
          });
        }
      }

      setForum(forumData);
      setError(null);
      return forumData;
    } catch (err) {
      console.error("Error fetching forum detail:", err);
      // Chỉ hiển thị lỗi khi không phải đang polling
      if (!isPolling) {
        setError(t('errorLoading'));
      }
      return null;
    } finally {
      // Chỉ cập nhật trạng thái loading khi không phải đang polling
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    fetchForumDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forumId, t]);

  // Lắng nghe sự kiện forumReactionChanged để tải lại dữ liệu
  useEffect(() => {
    const handleReactionChange = (event: CustomEvent) => {
      const { forumId: eventForumId } = event.detail;

      // Chỉ tải lại nếu đúng forum hiện tại
      if (eventForumId === forumId) {
        console.log("Detected reaction change, silently reloading forum data");
        fetchForumDetail(true); // Truyền true để chỉ ra đây là silent reload
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener('forumReactionChanged', handleReactionChange as EventListener);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('forumReactionChanged', handleReactionChange as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forumId]);

  // Sử dụng state để theo dõi trạng thái polling
  const [pollingActive, setPollingActive] = useState<boolean>(false);

  // Thiết lập polling chỉ khi cần thiết
  useEffect(() => {
    // Chỉ bắt đầu polling khi có tương tác từ người dùng
    const handleUserInteraction = () => {
      if (!pollingActive) {
        console.log("User interaction detected, activating polling");
        setPollingActive(true);
      }
    };

    // Lắng nghe các sự kiện tương tác của người dùng
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [pollingActive]);

  // State để theo dõi trạng thái polling hiện tại
  const [isCurrentlyPolling, setIsCurrentlyPolling] = useState<boolean>(false);

  // Thực hiện polling khi được kích hoạt
  useEffect(() => {
    if (!pollingActive) return;

    console.log("Polling activated for real-time updates");

    // Cập nhật dữ liệu mỗi 3 giây
    const intervalId = setInterval(() => {
      // Chỉ cập nhật nếu tab đang được hiển thị
      if (!document.hidden) {
        setIsCurrentlyPolling(true); // Đánh dấu đang polling
        console.log("Polling: Fetching forum data...", new Date().toLocaleTimeString());

        // Gọi API và theo dõi thời gian
        const startTime = performance.now();

        fetchForumDetail(true) // Truyền true để chỉ ra đây là polling
          .then(() => {
            const endTime = performance.now();
            console.log(`Polling completed in ${Math.round(endTime - startTime)}ms`);

            // So sánh dữ liệu trước và sau khi polling
            if (forum) {
              console.log("Reactions count:", forum.reactionTopics.length);
              console.log("Reaction types:", forum.reactionTopics.map(r => r.reactionType).join(', '));
            }
          })
          .finally(() => {
            setIsCurrentlyPolling(false); // Đánh dấu đã hoàn thành polling
          });
      }
    }, 3000);

    // Tự động dừng polling sau 2 phút nếu không có tương tác
    const timeoutId = setTimeout(() => {
      console.log("No recent interaction, deactivating polling");
      setPollingActive(false);
    }, 2 * 60 * 1000); // 2 phút

    // Cleanup khi component unmount hoặc khi polling bị tắt
    return () => {
      console.log("Cleaning up polling interval");
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingActive, forumId]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement comment submission logic here
    console.log("Comment submitted:", comment);
    setComment("");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
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
            {t('backToForum')}
          </button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="text-center my-5">
        <p className="fs-5">{t('postNotFound')}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => router.push(`/${locale}/forum`)}
        >
          {t('backToForum')}
        </button>
      </div>
    );
  }

  const dateLocale = locale === 'vi' ? vi : enUS;

  const formattedDate = formatDistanceToNow(new Date(forum.createdAt), {
    addSuffix: true,
    locale: dateLocale,
  });

  const exactDate = format(new Date(forum.createdAt), "dd/MM/yyyy HH:mm");

  return (
    <div className="container py-4">
      {/* Chỉ báo polling */}
      {pollingActive && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className={`toast ${isCurrentlyPolling ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <div className={`spinner-border spinner-border-sm me-2 ${isCurrentlyPolling ? '' : 'invisible'}`} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <strong className="me-auto">Real-time Updates</strong>
              <small>{new Date().toLocaleTimeString()}</small>
            </div>
            <div className="toast-body">
              {isCurrentlyPolling
                ? 'Đang cập nhật dữ liệu...'
                : 'Đang theo dõi thay đổi trong thời gian thực'}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          {/* Navigation */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link
                  href={`/${locale}/forum`}
                  className="text-decoration-none"
                >
                  {t('title')}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {forum.title}
              </li>
            </ol>
          </nav>

          {/* Forum Detail Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <div className="d-flex align-items-center">
                {/* User avatar */}
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

                {/* Username and post time */}
                <div>
                  <h6 className="mb-0 fw-bold">{forum.user.username}</h6>
                  <small className="text-muted" title={exactDate}>
                    {formattedDate}
                  </small>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Forum title */}
              <h4 className="card-title mb-3">{forum.title}</h4>

              {/* Forum image */}
              {forum.image && (
                <div className="forum-image mb-4">
                  <div className="rounded" style={{ position: "relative", width: "100%", height: "500px" }}>
                    <Image
                      src={forum.image}
                      alt={forum.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}

              {/* Forum content */}
              <div className="forum-content mb-4">
                <p className="card-text" style={{ whiteSpace: "pre-line" }}>
                  {forum.text}
                </p>
              </div>

              {/* Reactions and Actions */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <ForumReactions
                    forumId={forumId}
                    reactions={forum.reactionTopics.map(reaction => ({
                      reactionId: reaction.reactionId,
                      reactionType: reaction.reactionType as any,
                      createdAt: reaction.createdAt
                    }))}
                    onReactionChange={(newReactions) => {
                      console.log("Reaction change detected in ForumDetail:", newReactions.length);

                      // Cập nhật state với reactions mới ngay lập tức
                      setForum(prev => {
                        if (!prev) return null;

                        const updatedForum = {
                          ...prev,
                          reactionTopics: newReactions.map(reaction => ({
                            reactionId: reaction.reactionId,
                            reactionType: reaction.reactionType,
                            createdAt: reaction.createdAt,
                            userId: reaction.reactionId.split('_')[0] // Lấy userId từ reactionId
                          }))
                        };

                        console.log("Updated forum state with new reactions:",
                          updatedForum.reactionTopics.map(r => r.reactionType).join(', '));

                        return updatedForum;
                      });
                    }}
                  />

                  {/* Show edit and delete buttons if user is the author */}
                  {isAuthor && (
                    <>
                      <Link
                        href={`/${locale}/forum/edit/${forumId}`}
                        className="btn btn-outline-secondary me-2"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        {t('editPost')}
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
                  {forum.discussions.length} {t('comments')}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t('comments')} ({forum.discussions.length})</h5>
            </div>
            <div className="card-body">
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-4">
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={t('writeComment')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  {t('sendComment')}
                </button>
              </form>

              {/* Comments List */}
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
                          <div className="fw-bold mb-1">{t('author')}</div>
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
                  <p className="text-muted mb-0">
                    {t('noComments')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Author Info */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t('author')}</h5>
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
                    {t('joinedOn')}:{" "}
                    {format(new Date(forum.user.createdAt), "MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Forum Stats */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t('postStats')}</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t('postedOn')}</span>
                  <span>{format(new Date(forum.createdAt), "dd/MM/yyyy")}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t('likes')}</span>
                  <span className="badge bg-primary rounded-pill">
                    {forum.reactionTopics.length}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>{t('comments')}</span>
                  <span className="badge bg-primary rounded-pill">
                    {forum.discussions.length}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Back to Forum */}
          <div className="d-grid gap-2">
            <Link href={`/${locale}/forum`} className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              {t('backToForum')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
