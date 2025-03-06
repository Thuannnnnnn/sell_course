"use client";

import { EditForumForm } from "@/components/forum";
import { useParams } from "next/navigation";

export default function EditForumPage() {
  const params = useParams();
  const forumId = params.forumId as string;

  return <EditForumForm forumId={forumId} />;
}
