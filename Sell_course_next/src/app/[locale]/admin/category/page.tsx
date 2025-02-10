"use client";
import Sidebar from "@/components/SideBar";
import type { Category } from "@/app/type/category/Category";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/api/category/CategoryAPI";
import CategoryList from "@/components/category/CategoryList";
import "../../../../style/Category.css";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession()
  const t = useTranslations('categoies')
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        if (!session?.user.token) {
          return;
        }
        const data = await fetchCategories(session.user.token);
        setCategories(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load categories." + error);
        setLoading(false);
      }
    };

    loadCategories();
    console.log("load daa: " + JSON.stringify(categories, null, 2));
  }, [session, categories]);

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
          <CategoryList categories={categories} setCategories={setCategories} />
        </div>
      </div>
    </>
  );
}
