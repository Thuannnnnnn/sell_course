"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchCategories, deleteCategory } from "../api/categories/category";
import { Category } from "../types/category";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";

export default function CategoryManagementPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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
    router.push("/categories/add");
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Category Management</CardTitle>
        <Button onClick={handleAdd}>Add Category</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground text-xs font-medium border-b border-border">
                  <th className="p-4 whitespace-nowrap">Category Name</th>
                  <th className="p-4 whitespace-nowrap">Description</th>
                  <th className="p-4 whitespace-nowrap">Parent Category</th>
                  <th className="p-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-muted/50">
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4">{cat.description}</td>
                    <td className="p-4">{
                      cat.parentId
                        ? (categories.find((c) => c.categoryId === cat.parentId)?.name || "-")
                        : "-"
                    }</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => router.push(`/categories/edit/${cat.categoryId}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(cat.categoryId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No categories found.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}