import React from "react";
import "../../style/Category.css";
import { Category } from "@/app/type/category/Category";
import { deleteCategory } from "@/app/api/category/CategoryAPT";
import { Container } from "react-bootstrap";
import { useTranslations } from "next-intl";
interface CategoryListProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}
const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  setCategories,
}) => {
  const t = useTranslations("categoies");
  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategories((prev) =>
        prev.filter((category) => category.categoryId !== categoryId)
      );
    } catch (error) {
      console.error("Failed to delete category: ", error);
      alert("Failed to delete category.");
    }
  };

  return (
    <Container className="course-table">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>{t("name")}</th>
            <th>{t("description")}</th>
            <th>{t("parentCategory")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category.categoryId}>
              <td>
                <div>#{index + 1}</div>
              </td>
              <td>{category.name}</td>
              <td>{category.name}</td>
              <td>{category.parentId ? `Parent: ${category.parentId}` : ""}</td>
              <td>
                <button
                  onClick={() => console.log("Edit category:", category)}
                  style={{ marginRight: "10px" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-pencil-square"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                    <path
                      fill-rule="evenodd"
                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                    />
                  </svg>
                </button>
                <button onClick={() => handleDelete(category.categoryId)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
};

export default CategoryList;
