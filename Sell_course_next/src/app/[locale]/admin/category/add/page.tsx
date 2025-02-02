"use client";

import React, { useState, useEffect } from "react";
import { addCategory, fetchCategories } from "@/app/api/category/CategoryAPT";
import "@/style/Category.css";
import { Category } from "@/app/type/category/Category";

interface SubCategory {
  name: string;
  description: string;
}

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subCategoryErrors, setSubCategoryErrors] = useState<
    { name: string; description: string }[]
  >([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const validateForm = () => {
    let isValid = true;
    let newErrors = { name: "", description: "" };
    let newSubErrors = subCategories.map(() => ({ name: "", description: "" }));

    // Validate main category
    if (name.trim().length < 3) {
      newErrors.name = "Tên danh mục phải có ít nhất 3 ký tự.";
      isValid = false;
    }
    if (description.trim().length < 5) {
      newErrors.description = "Mô tả phải có ít nhất 5 ký tự.";
      isValid = false;
    }

    // Validate sub categories
    subCategories.forEach((subCat, index) => {
      if (subCat.name.trim().length < 3) {
        newSubErrors[index].name = "Tên danh mục phải có ít nhất 3 ký tự.";
        isValid = false;
      }
      if (subCat.description.trim().length < 5) {
        newSubErrors[index].description = "Mô tả phải có ít nhất 5 ký tự.";
        isValid = false;
      }
    });

    setError(newErrors);
    setSubCategoryErrors(newSubErrors);
    return isValid;
  };

  const addSubCategory = () => {
    setSubCategories([...subCategories, { name: "", description: "" }]);
    setSubCategoryErrors([...subCategoryErrors, { name: "", description: "" }]);
  };

  const removeSubCategory = (index: number) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
    setSubCategoryErrors(subCategoryErrors.filter((_, i) => i !== index));
  };

  const updateSubCategory = (
    index: number,
    field: keyof SubCategory,
    value: string
  ) => {
    const newSubCategories = [...subCategories];
    newSubCategories[index] = { ...newSubCategories[index], [field]: value };
    setSubCategories(newSubCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const parentCategory = await addCategory({
        categoryId: "",
        name,
        description,
        parentId: undefined,
        children: [],
      });

      if (!parentCategory?.categoryId) {
        throw new Error("Không thể tạo danh mục cha.");
      }

      const parentId = parentCategory.categoryId;

      await Promise.all(
        subCategories.map(async (subCat) => {
          await addCategory({
            categoryId: "",
            name: subCat.name,
            description: subCat.description,
            parentId: parentId,
            children: [],
          });
        })
      );

      alert("Thêm danh mục thành công!");
      setName("");
      setDescription("");
      setError({ name: "", description: "" });
      setSubCategories([]);
      setSubCategoryErrors([]);
    } catch (error: any) {
      alert(`Lỗi khi thêm danh mục: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="add-category-container">
      <h1 className="add-category-title">Thêm Danh Mục Mới</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          {/* Category Name */}
          <div className="form-group">
            <label>Tên danh mục</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục"
            />
            {error.name && <p className="error-text">{error.name}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả danh mục"
            />
            {error.description && (
              <p className="error-text">{error.description}</p>
            )}
          </div>
        </div>

        {/* Sub Categories */}
        <div className="sub-categories-section">
          <div className="sub-categories-header">
            <h3 className="sub-categories-title">Danh mục con</h3>
            <button
              type="button"
              onClick={addSubCategory}
              className="btn btn-add"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Thêm danh mục con
            </button>
          </div>

          {subCategories.map((subCat, index) => (
            <div key={index} className="sub-category-form">
              <div className="sub-category-header">
                <h4 className="sub-category-title">
                  Danh mục con #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeSubCategory(index)}
                  className="btn btn-remove"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4L12 12M4 12L12 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="form-group">
                <label>Tên danh mục con</label>
                <input
                  type="text"
                  className="form-control"
                  value={subCat.name}
                  onChange={(e) =>
                    updateSubCategory(index, "name", e.target.value)
                  }
                  placeholder="Nhập tên danh mục con"
                />
                {subCategoryErrors[index]?.name && (
                  <p className="error-text">{subCategoryErrors[index].name}</p>
                )}
              </div>

              <div className="form-group">
                <label>Mô tả danh mục con</label>
                <textarea
                  className="form-control"
                  value={subCat.description}
                  onChange={(e) =>
                    updateSubCategory(index, "description", e.target.value)
                  }
                  placeholder="Nhập mô tả danh mục con"
                />
                {subCategoryErrors[index]?.description && (
                  <p className="error-text">
                    {subCategoryErrors[index].description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-cancel"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4L4 10M4 10L10 16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Hủy
          </button>
          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 10L8 14L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Lưu danh mục
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
