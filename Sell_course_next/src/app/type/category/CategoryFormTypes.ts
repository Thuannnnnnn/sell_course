import { Category } from "./Category";

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface CategoryFormErrors {
  name: string;
  description: string;
}

export interface SubCategoryFormData {
  name: string;
  description: string;
}

export interface CategoryFormProps {
  name: string;
  description: string;
  error: CategoryFormErrors;
  onChange: (field: "name" | "description", value: string) => void;
}

export interface SubCategoryFormProps {
  index: number;
  data: SubCategoryFormData;
  error: CategoryFormErrors;
  onUpdate: (
    index: number,
    field: keyof SubCategoryFormData,
    value: string
  ) => void;
  onRemove: (index: number) => void;
}

export interface SubCategoryListProps {
  subCategories: SubCategoryFormData[];
  subCategoryErrors: CategoryFormErrors[];
  onUpdate: (
    index: number,
    field: keyof SubCategoryFormData,
    value: string
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export interface FormButtonsProps {
  loading: boolean;
  onCancel: () => void;
  submitText: string;
  cancelText: string;
  loadingText: string;
}
