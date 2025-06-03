"use client";
import React, { useEffect, useState } from "react";
import { Eye, Edit, Archive } from "lucide-react";
import Link from "next/link";

export function CategoryList() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:8080/api/admin/categories/view_category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        // Giả sử API trả về mảng các category có id và name
        setCategories(data);
      } catch (err) {
        let message = "Unknown error";
        if (err instanceof Error) message = err.message;
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Link href="/categories/add">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
            Add New Category
          </button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground text-xs font-medium border-b border-border">
                <th className="p-4 whitespace-nowrap">Category Name</th>
                <th className="p-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <span className="font-medium">{category.name}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-foreground">
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 