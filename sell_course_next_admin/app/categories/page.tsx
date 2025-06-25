"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchCategories, deleteCategory, addCategory, updateCategory } from "../api/categories/category";
import { Category } from "../types/category";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Edit, Trash2, Plus, FolderOpen, Search } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
  categories: Category[];
}

function EditCategoryModal({
  open,
  onClose,
  onSuccess,
  category,
  categories,
}: EditCategoryModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category && open) {
      setName(category.name);
      setDescription(category.description || "");
      setParentId(category.parentId || "none");
      setError("");
    } else if (!open) {
      setName("");
      setDescription("");
      setParentId("none");
      setError("");
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken || !category) return;
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateCategory({
        categoryId: category.categoryId,
        name: name.trim(),
        description: description.trim(),
        parentId: parentId === "none" ? null : parentId,
      }, session.accessToken);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to update category."
        );
      } else {
        setError("Failed to update category.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Edit Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-parentId">Parent Category (Optional)</Label>
                <Select
                  key={`edit-${category.categoryId}-${parentId}`}
                  value={parentId}
                  onValueChange={setParentId}
                >
                  <SelectTrigger id="edit-parentId">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .filter((cat) => {
                        if (cat.categoryId === category.categoryId) return false;
                        if (cat.parentId === category.categoryId) return false;
                        return true;
                      })
                      .map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#513deb',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#513deb';
                    }
                  }}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddCategoryModal({
  open,
  onClose,
  onSuccess,
  categories,
}: AddCategoryModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setParentId("none");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addCategory({
        categoryId: "",
        name: name.trim(),
        description: description.trim(),
        parentId: parentId === "none" ? null : parentId,
      }, session.accessToken);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to create category."
        );
      } else {
        setError("Failed to create category.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="parentId">Parent Category (Optional)</Label>
                <Select
                  value={parentId}
                  onValueChange={setParentId}
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#513deb',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#513deb';
                    }
                  }}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CategoryManagementPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError("");
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          setLoading(false);
          return;
        }
        const data = await fetchCategories(session.accessToken);
        setCategories(data);
      } catch {
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [session]);

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(categoryId, session.accessToken);
      setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to delete category. Please try again.");
      }
    }
  };

  const refreshCategories = async () => {
    if (!session?.accessToken) return;
    try {
      const data = await fetchCategories(session.accessToken);
      setCategories(data);
    } catch {
      setError("Failed to reload categories.");
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.parentId && categories.find((c) => c.categoryId === cat.parentId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">
              Manage your course categories here.
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAdd}
            style={{
              backgroundColor: '#513deb',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#513deb';
            }}
          >
            <Plus className="h-5 w-5" />
            Create Category
          </Button>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchTerm ? "No categories found matching your search." : "No categories found. Create your first category to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.categoryId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {cat.description || "No description"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {cat.parentId ? (
                            <Badge variant="outline">
                              {categories.find((c) => c.categoryId === cat.parentId)?.name || "Unknown"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(cat)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(cat.categoryId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredCategories.length} of {categories.length} categories.
              </div>
            )}
          </div>
        )}
      </div>

      <AddCategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshCategories}
        categories={categories}
      />

      <EditCategoryModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={refreshCategories}
        category={selectedCategory}
        categories={categories}
      />
    </div>
  );
}