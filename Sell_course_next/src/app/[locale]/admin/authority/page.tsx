"use client";

import Sidebar from "@/components/SideBar";
import type { Category } from "@/app/type/category/Category";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/api/category/CategoryAPT";
import CategoryList from "@/components/category/CourseList";
import "../../../../style/Category.css";
import { useTranslations } from "next-intl";

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("authorityPage");
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load categories." + error);
        setLoading(false);
      }
    };

    loadCategories();
    console.log("load daa: " + JSON.stringify(categories, null, 2));
  }, []);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>{error}</p>;
  return (
    <>
      <div className="d-flex">
        <div>
          <div className="sidebar-page">
            <Sidebar />
          </div>
        </div>
        <div style={{ width: "75%" }}>
          <h3 style={{ paddingLeft: "15px" }}>{t("title")}</h3>
          <CategoryList categories={categories} setCategories={setCategories} />
        </div>
      </div>
    </>
  );
}
