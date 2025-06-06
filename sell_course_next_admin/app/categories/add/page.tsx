"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { addCategory, fetchCategories } from "@/app/api/categories/category";
import { Category } from "@/app/types/category";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AddCategoryPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      if (!session?.accessToken) return;
      try {
        const data = await fetchCategories(session.accessToken);
        setCategories(data);
      } catch {
        // ignore
      }
    };
    loadCategories();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }
    if (!session?.accessToken) {
      setError("Bạn chưa đăng nhập hoặc thiếu quyền truy cập.");
      return;
    }
    setLoading(true);
    try {
      await addCategory(
        {
          categoryId: "", // Add empty categoryId to match Category type
          name,
          description,
          parentId: parentId || undefined,
        },
        session.accessToken
      );
      setSuccess("Thêm danh mục thành công!");
      setName("");
      setDescription("");
      setParentId(null);
      setTimeout(() => router.push("/categories"), 1000);
    } catch {
      setError("Thêm danh mục thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Thêm danh mục mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên danh mục</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả (tuỳ chọn)"
            />
          </div>
          <div>
            <Label htmlFor="parent">Danh mục cha</Label>
            <select
              id="parent"
              className="w-full border rounded-md p-2 bg-background"
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
            >
              <option value="">Không có</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/categories")}
            >
              Huỷ
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
