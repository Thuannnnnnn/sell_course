"use client";

import { ForumDetail } from "@/components/forum";
import { useTranslations } from "next-intl";

export default function ForumDetailPage() {
  const t = useTranslations("Forum");

  return <ForumDetail />;
}
