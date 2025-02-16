import React from "react";
import { SubCategoryFormProps } from "@/app/type/category/CategoryFormTypes";
import { useTranslations } from "next-intl";

export const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
  index,
  data,
  error,
  onUpdate,
  onRemove,
}) => {
  const t = useTranslations("categories");
  return (
    <div className="sub-category-form">
      <div className="sub-category-header">
        <h4 className="sub-category-title">
          {t("TitleCreateSubCategory")} #{index + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
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
        <label>{t("name")}</label>
        <input
          type="text"
          className="form-control"
          value={data.name}
          onChange={(e) => onUpdate(index, "name", e.target.value)}
          placeholder={t("placeHodelName")}
        />
        {error.name && <p className="error-text">{error.name}</p>}
      </div>

      <div className="form-group">
        <label>{t("description")}</label>
        <textarea
          className="form-control"
          value={data.description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          placeholder={t("placeHodelDescription")}
        />
        {error.description && <p className="error-text">{error.description}</p>}
      </div>
    </div>
  );
};
