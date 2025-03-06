"use client";

import React from "react";
import { Forum } from "@/app/api/forum/forum";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ForumCardProps {
  forum: Forum;
}

const ForumCard: React.FC<ForumCardProps> = ({ forum }) => {
  const params = useParams();
  const locale = params.locale as string;

  const formattedDate = formatDistanceToNow(new Date(forum.createdAt), {
    addSuffix: true,
    locale: vi || enUS,
  });

  return (
    <div className="card mb-4 shadow-sm">
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
          </div>
        </div>
      </div>

      <Link
        href={`/${locale}/forum/${forum.forumId}`}
        className="text-decoration-none text-dark"
      >
        <div className="card-body p-0">
          <h5 className="card-title px-3 pt-3 mb-2">{forum.title}</h5>

          {forum.image && (
            <div className="forum-image mb-3">
              <img
                src={forum.image}
                alt={forum.title}
                className="img-thumbnail w-100"
                style={{ maxHeight: "300px", objectFit: "cover" }}
              />
            </div>
          )}

          <p className="card-text px-3 mb-2">
            {forum.text.length > 200
              ? `${forum.text.substring(0, 200)}...`
              : forum.text}
          </p>

          <div className="px-3 pb-3 text-muted small">
            <i className="bi bi-clock me-1"></i> {formattedDate}
          </div>
        </div>
      </Link>

      <div className="card-footer bg-white d-flex justify-content-between py-2">
        <div>
          <i className="bi bi-chat-left-text me-1"></i>
          {forum.discussions.length} bình luận
        </div>
        <div>
          <i className="bi bi-hand-thumbs-up me-1"></i>
          {forum.reactionTopics.length} Like
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
