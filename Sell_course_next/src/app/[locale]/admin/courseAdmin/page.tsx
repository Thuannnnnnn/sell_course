"use client";
import Sidebar from "@/components/SideBar";
import type { Category } from "@/app/type/category/Category";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/api/category/CategoryAPI";
import CourseList from "@/components/course/courseListAdmin";
import "../../../../style/Category.css";
import { useTranslations } from "next-intl";

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('categoies')
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
        <div className="layout-right">
          <h3>{t("category")}</h3>
          <CourseList courses={} setCouse={} />
        </div>
      </div>
    </>
  );
}
