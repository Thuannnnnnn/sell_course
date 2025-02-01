import React from "react";
import "../../style/Category.css";
import { Category } from "@/app/type/category/Category";
import { deleteCategory } from "@/app/api/category/CategoryAPT";
import { Container } from "react-bootstrap";
interface CategoryListProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}
const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  setCategories,
}) => {
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
            <th>Name</th>
            <th>Description</th>
            <th>Parent Category</th>
            <th>Actions</th>
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
                  ✏️
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
