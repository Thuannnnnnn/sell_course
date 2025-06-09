"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { updateCategory, fetchCategories } from "../../../api/categories/category";
import { Category } from "../../../types/category";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      if (!session?.accessToken) {
        setError("You are not logged in or lack access rights.");
        setInitialLoading(false);
        return;
      }
      try {
        const data = await fetchCategories(session.accessToken);
        setCategories(data);
        // Find the current category
        const currentCategory = data.find((cat: Category) => cat.categoryId === params.id);
        if (currentCategory) {
          setName(currentCategory.name);
          setDescription(currentCategory.description);
          setParentId(currentCategory.parentId || null);
        } else {
          setError("Category not found.");
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load category information. Please try again later.");
        }
      } finally {
        setInitialLoading(false);
      }
    };
    loadCategories();
  }, [session, params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken) {
      setError("You are not logged in or lack access rights.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedCategory: Category = {
        categoryId: params.id,
        name: name.trim(),
        description: description.trim(),
        parentId,
      };

      await updateCategory(updatedCategory, session.accessToken);
      setSuccess("Category updated successfully!");
      setTimeout(() => {
        router.push("/categories");
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update category. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category</Label>
            <Select
              value={parentId || "none"}
              onValueChange={(value: string) => setParentId(value === "none" ? null : value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories
                  .filter((cat: Category) => cat.categoryId !== params.id)
                  .map((cat: Category) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/categories")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}