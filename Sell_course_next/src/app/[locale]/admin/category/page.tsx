"use client";
import Sidebar from "@/components/SideBar";
import type { Category } from "@/app/type/category/Category";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/api/category/CategoryAPI";
import CategoryList from "@/components/category/CategoryList";
import "../../../../style/Category.css";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "@/style/courseAdmin.css";

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const t = useTranslations("categories");
  const router = useRouter();
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
  }, [session?.user?.token]);

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
          <Button
            className="button-create"
            onClick={() => router.push("category/add")}
          >
            <span className="icon">+</span>
            {t("create")}
          </Button>
          <CategoryList categories={categories} setCategories={setCategories} />
        </div>
      </div>
    </>
  );
}
