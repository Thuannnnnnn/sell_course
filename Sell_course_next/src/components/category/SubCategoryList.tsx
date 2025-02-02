import React from "react";
import { SubCategoryListProps } from "@/app/type/category/CategoryFormTypes";
import { SubCategoryForm } from "./SubCategoryForm";

export const SubCategoryList: React.FC<SubCategoryListProps> = ({
  subCategories,
  subCategoryErrors,
  onUpdate,
  onAdd,
  onRemove,
}) => {
  return (
    <div className="sub-categories-section">
      <div className="sub-categories-header">
        <h3 className="sub-categories-title">Danh mục con</h3>
        <button type="button" onClick={onAdd} className="btn btn-add">
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
        <SubCategoryForm
          key={index}
          index={index}
          data={subCat}
          error={subCategoryErrors[index]}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
