"use client";

import { ForumPage } from "@/components/forum";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Forum() {
  const t = useTranslations("Forum");
  const [posts, setPosts] = useState([]);

  return <ForumPage />;
}
