"use client";

import { CreateForumForm } from "@/components/forum";
import { useTranslations } from "next-intl";

export default function CreateForumPage() {
  const t = useTranslations("Forum");

  return <CreateForumForm />;
}