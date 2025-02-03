"use client";

import UpdateCategoryPage from "@/components/category/UpdateCategoryPage";
import { useParams } from "next/navigation";

export default function EditCategory() {
  const params = useParams();
  const categoryId = params.id as string;

  return <UpdateCategoryPage categoryId={categoryId} />;
}
