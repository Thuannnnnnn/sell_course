"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateCategory,
  fetchCategories,
} from "@/app/api/category/CategoryAPT";
import { Category } from "@/app/type/category/Category";
import { CategoryForm } from "./CategoryForm";
import "@/style/Category.css";
import { FormButtons } from "../FormButtons";
import { useTranslations } from "next-intl";

interface UpdateCategoryPageProps {
  categoryId: string;
}

const UpdateCategoryPage: React.FC<UpdateCategoryPageProps> = ({
  categoryId,
}) => {
  const router = useRouter();
  const t = useTranslations("categoies");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState({ name: "", description: "" });
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [subCategoryErrors, setSubCategoryErrors] = useState<{
    [key: string]: { name: string; description: string };
  }>({});

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await fetchCategories();
        const currentCategory = categories.find(
          (cat) => cat.categoryId === categoryId
        );

        if (currentCategory) {
          setCategory(currentCategory);
          setFormData({
            name: currentCategory.name,
            description: currentCategory.description || "",
          });

          if (!currentCategory.parentId) {
            const subs = categories.filter(
              (cat) => cat.parentId === categoryId
            );
            setSubCategories(subs);
            const initialSubErrors = subs.reduce(
              (acc, sub) => ({
                ...acc,
                [sub.categoryId]: { name: "", description: "" },
              }),
              {}
            );
            setSubCategoryErrors(initialSubErrors);
          }
        } else {
          console.error("Category not found");
        }
      } catch (error) {
        console.error("Failed to load category:", error);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const validateForm = () => {
    let isValid = true;
    let newErrors = { name: "", description: "" };
    let newSubErrors = { ...subCategoryErrors };

    if (formData.name.trim().length < 3) {
      newErrors.name = "Tên danh mục phải có ít nhất 3 ký tự.";
      isValid = false;
    }
    if (formData.description.trim().length < 5) {
      newErrors.description = "Mô tả phải có ít nhất 5 ký tự.";
      isValid = false;
    }

    subCategories.forEach((subCat) => {
      newSubErrors[subCat.categoryId] = { name: "", description: "" };

      if (subCat.name.trim().length < 3) {
        newSubErrors[subCat.categoryId].name =
          "Tên danh mục phải có ít nhất 3 ký tự.";
        isValid = false;
      }
      if (subCat.description.trim().length < 5) {
        newSubErrors[subCat.categoryId].description =
          "Mô tả phải có ít nhất 5 ký tự.";
        isValid = false;
      }
    });

    setError(newErrors);
    setSubCategoryErrors(newSubErrors);
    return isValid;
  };

  const handleFormChange = (field: "name" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubCategoryChange = (
    categoryId: string,
    field: "name" | "description",
    value: string
  ) => {
    setSubCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId ? { ...cat, [field]: value } : cat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !category) return;

    setLoading(true);
    try {
      await updateCategory({
        ...category,
        name: formData.name,
        description: formData.description,
      });

      if (subCategories.length > 0) {
        await Promise.all(
          subCategories.map((subCat) =>
            updateCategory({
              ...subCat,
              name: subCat.name,
              description: subCat.description,
            })
          )
        );
      }

      alert("Cập nhật danh mục thành công!");
      router.back();
    } catch (error: any) {
      alert(`Lỗi khi cập nhật danh mục: ${error.message}`);
    }
    setLoading(false);
  };

  if (!category) {
    return <div>Loading...</div>;
  }

  if (category.parentId) {
    return (
      <div className="update-category-container">
        <h1 className="update-category-title">{t("updateSubCategory")}</h1>
        <form onSubmit={handleSubmit}>
          <CategoryForm
            name={formData.name}
            description={formData.description}
            error={error}
            onChange={handleFormChange}
          />
          <FormButtons
            onCancel={() => router.back()}
            loading={loading}
            submitText={t("updateCategory")}
            cancelText={t("categoryCancel")}
            loadingText={t("updating")}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="update-category-container">
      <h1 className="update-category-title">{t("updateCategory")}</h1>

      <form onSubmit={handleSubmit}>
        <CategoryForm
          name={formData.name}
          description={formData.description}
          error={error}
          onChange={handleFormChange}
        />

        {subCategories.length > 0 && (
          <div className="sub-categories-section">
            <h2>{t("subCategories")}</h2>
            {subCategories.map((subCat) => (
              <div key={subCat.categoryId} className="sub-category-form">
                <CategoryForm
                  name={subCat.name}
                  description={subCat.description}
                  error={subCategoryErrors[subCat.categoryId]}
                  onChange={(field, value) =>
                    handleSubCategoryChange(subCat.categoryId, field, value)
                  }
                />
              </div>
            ))}
          </div>
        )}

        <FormButtons
          onCancel={() => router.back()}
          loading={loading}
          submitText={t("updateCategory")}
          cancelText={t("categoryCancel")}
          loadingText={t("updating")}
        />
      </form>
    </div>
  );
};

export default UpdateCategoryPage;
