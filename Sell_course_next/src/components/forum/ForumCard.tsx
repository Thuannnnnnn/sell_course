"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ForumReactionsReadOnly from "./ForumReactionsReadOnly";
import { validateReactionType } from "@/app/type/forum/forum";
import { Forum } from "@/app/type/forum/forum";

interface ForumCardProps {
  forum: Forum;
}

const ForumCard: React.FC<ForumCardProps> = ({ forum }) => {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("Forum");
  const [forumState] = useState<Forum>(forum);

  const dateLocale = locale === "vi" ? vi : enUS;

  const formattedDate = formatDistanceToNow(new Date(forumState.createdAt), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-white border-0">
        <div className="d-flex align-items-center">
          <div className="me-3">
            {forumState.user.avatarImg ? (
              <Image
                src={forumState.user.avatarImg}
                alt={forumState.user.username}
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
                {forumState.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h6 className="mb-0 fw-bold">{forumState.user.username}</h6>
          </div>
        </div>
      </div>

      <Link
        href={`/${locale}/forum/${forumState.forumId}`}
        className="text-decoration-none text-dark"
      >
        <div className="card-body p-0">
          <h5 className="card-title px-3 pt-3 mb-2">{forumState.title}</h5>

          {forumState.image && (
            <div className="forum-image mb-3">
              <div
                className="img-thumbnail w-100"
                style={{ position: "relative", height: "300px" }}
              >
                <Image
                  src={forumState.image}
                  alt={forumState.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          )}

          <p className="card-text px-3 mb-2">
            {forumState.text.length > 200
              ? `${forumState.text.substring(0, 200)}...`
              : forumState.text}
          </p>

          <div className="px-3 pb-3 text-muted small">
            <i className="bi bi-clock me-1"></i> {formattedDate}
          </div>
        </div>
      </Link>

      <div className="card-footer bg-white d-flex justify-content-between py-2">
        <div>
          <i className="bi bi-chat-left-text me-1"></i>
          {forumState.discussions.length} {t("comments")}
        </div>
        <div className="reaction-summary">
          <ForumReactionsReadOnly
            reactions={forumState.reactionTopics.map((reaction) => ({
              reactionId: reaction.reactionId,
              reactionType: validateReactionType(reaction.reactionType),
              createdAt: reaction.createdAt,
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
