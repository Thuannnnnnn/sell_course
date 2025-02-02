import React from 'react';
import { CategoryFormProps } from '@/app/type/category/CategoryFormTypes';

export const CategoryForm: React.FC<CategoryFormProps> = ({
  name,
  description,
  error,
  onNameChange,
  onDescriptionChange,
}) => {
  return (
    <div className="form-section">
      <div className="form-group">
        <label>Tên danh mục</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nhập tên danh mục"
        />
        {error.name && <p className="error-text">{error.name}</p>}
      </div>

      <div className="form-group">
        <label>Mô tả</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Nhập mô tả danh mục"
        />
        {error.description && <p className="error-text">{error.description}</p>}
      </div>
    </div>
  );
};