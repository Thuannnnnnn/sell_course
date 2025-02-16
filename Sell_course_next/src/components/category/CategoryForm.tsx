import React from "react";
import { CategoryFormProps } from "@/app/type/category/CategoryFormTypes";
import { useTranslations } from "next-intl";

export const CategoryForm: React.FC<CategoryFormProps> = ({
  name,
  description,
  error,
  onChange,
}) => {
  const t = useTranslations("categories");
  return (
    <div className="form-section">
      <div className="form-group">
        <label>{t("name")}</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={t("placeHodelName")}
        />
        {error.name && <p className="error-text">{error.name}</p>}
      </div>

      <div className="form-group">
        <label>{t("description")}</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={t("placeHodelDescription")}
        />
        {error.description && <p className="error-text">{error.description}</p>}
      </div>
    </div>
  );
};
