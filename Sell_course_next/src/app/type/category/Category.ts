export interface Category {
  categoryId: string;
  name: string;
  description: string;
  parentId?: string | null;
  children: Category[] | null;
}
