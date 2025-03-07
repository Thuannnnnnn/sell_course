'use client';

import React, { useState, useEffect } from 'react';
import { addCategory, fetchCategories } from '@/app/api/category/CategoryAPI';
import '@/style/Category.css';
import { Category } from '@/app/type/category/Category';
import { CategoryForm } from '@/components/category/CategoryForm';
import { SubCategoryList } from '@/components/category/SubCategoryList';
import { FormButtons } from '@/components/FormButtons';
import {
  CategoryFormErrors,
  SubCategoryFormData,
} from '@/app/type/category/CategoryFormTypes';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

export default function AddCategoryPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<CategoryFormErrors>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryFormData[]>([]);
  const [subCategoryErrors, setSubCategoryErrors] = useState<
    CategoryFormErrors[]
  >([]);
  const t = useTranslations('categories');
  const { data: session } = useSession();
  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (!session?.user.token) return;
        const data = await fetchCategories(session?.user.token);
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, [session]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', description: '' };
    const newSubErrors = subCategories.map(() => ({ name: '', description: '' }));

    if (name.trim().length < 3) {
      newErrors.name = 'Tên danh mục phải có ít nhất 3 ký tự.';
      isValid = false;
    }
    if (description.trim().length < 5) {
      newErrors.description = 'Mô tả phải có ít nhất 5 ký tự.';
      isValid = false;
    }

    subCategories.forEach((subCat, index) => {
      if (subCat.name.trim().length < 3) {
        newSubErrors[index].name = 'Tên danh mục phải có ít nhất 3 ký tự.';
        isValid = false;
      }
      if (subCat.description.trim().length < 5) {
        newSubErrors[index].description = 'Mô tả phải có ít nhất 5 ký tự.';
        isValid = false;
      }
    });

    setError(newErrors);
    setSubCategoryErrors(newSubErrors);
    return isValid;
  };

  const addSubCategory = () => {
    setSubCategories([...subCategories, { name: '', description: '' }]);
    setSubCategoryErrors([...subCategoryErrors, { name: '', description: '' }]);
  };

  const removeSubCategory = (index: number) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
    setSubCategoryErrors(subCategoryErrors.filter((_, i) => i !== index));
  };

  const updateSubCategory = (
    index: number,
    field: keyof SubCategoryFormData,
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
      if (!session?.user.token) return;
      console.log(session?.user.token);
      const parentCategory = await addCategory({
        categoryId: '',
        name,
        description,
        parentId: undefined,
        children: [],
      },
      session?.user.token);

      if (!parentCategory?.categoryId) {
        throw new Error('Không thể tạo danh mục cha.');
      }

      const parentId = parentCategory.categoryId;

      await Promise.all(
        subCategories.map(async (subCat) => {
          await addCategory({
            categoryId: '',
            name: subCat.name,
            description: subCat.description,
            parentId: parentId,
            children: [],
          },
          session?.user.token);
        })
      );

      alert('Thêm danh mục thành công!');
      setName('');
      setDescription('');
      setError({ name: '', description: '' });
      setSubCategories([]);
      setSubCategoryErrors([]);
    } catch {
      alert('Lỗi khi thêm danh mục');
    }
    setLoading(false);
  };

  return (
    <div className="add-category-container">
      <h1 className="add-category-title">{t('createNewCategory')}</h1>

      <form onSubmit={handleSubmit}>
        <CategoryForm
          name={name}
          description={description}
          error={error}
          onChange={(field, value) => {
            if (field === 'name') setName(value);
            if (field === 'description') setDescription(value);
          }}
        />

        <SubCategoryList
          subCategories={subCategories}
          subCategoryErrors={subCategoryErrors}
          onUpdate={updateSubCategory}
          onAdd={addSubCategory}
          onRemove={removeSubCategory}
        />

        <FormButtons
          loading={loading}
          onCancel={() => window.history.back()}
          submitText={t('categorySummit')}
          cancelText={t('categoryCancel')}
          loadingText={t('loading')}
        />
      </form>
    </div>
  );
}
