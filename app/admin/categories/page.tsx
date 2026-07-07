"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBCategory } from "@/lib/database.types";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DBCategory>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<DBCategory>>({
    name: "",
    slug: "",
    description: "",
    image: "",
    video_url: "",
    tagline: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  async function fetchCategories(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          setLoading(false);
          toast.error("Request taking too long. Please refresh.");
        }
      }, 10000);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      clearTimeout(timeoutId);
      if (signal?.aborted) return;

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Error:", error);
      toast.error("Connection error");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  async function saveCategory(category: Partial<DBCategory>, isNew = false) {
    const supabase = createClient();

    try {
      if (isNew) {
        const { error } = await supabase.from("categories").insert({
          ...category,
          slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, "-"),
          display_order: categories.length,
        });
        if (error) throw error;
        toast.success("Category created");
        setIsAdding(false);
        setNewCategory({
          name: "",
          slug: "",
          description: "",
          image: "",
          video_url: "",
          tagline: "",
          display_order: 0,
          is_active: true,
        });
      } else {
        const { error } = await supabase
          .from("categories")
          .update({ ...category, updated_at: new Date().toISOString() })
          .eq("id", category.id);
        if (error) throw error;
        toast.success("Category updated");
        setEditingId(null);
      }
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  }

  function deleteCategory(id: string) {
    confirmToast("Are you sure you want to delete this category?", async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("categories")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete category");
      } else {
        toast.success("Category deleted");
        fetchCategories();
      }
    });
  }

  async function toggleCategoryActive(id: string, isActive: boolean) {
    const supabase = createClient();

    const { error } = await supabase
      .from("categories")
      .update({ is_active: !isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update category status");
    } else {
      toast.success(isActive ? "Category deactivated" : "Category activated");
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? { ...category, is_active: !isActive } : category
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name || ""}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
            <input
              type="text"
              placeholder="Slug (auto-generated)"
              value={newCategory.slug || ""}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
            <input
              type="text"
              placeholder="Tagline"
              value={newCategory.tagline || ""}
              onChange={(e) => setNewCategory({ ...newCategory, tagline: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
            <textarea
              placeholder="Description"
              value={newCategory.description || ""}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              rows={2}
            />
            <CloudinaryUpload
              label="Category Image"
              value={newCategory.image || ""}
              onChange={(url) => setNewCategory({ ...newCategory, image: url })}
              type="image"
            />
            <CloudinaryUpload
              label="Category Video (optional)"
              value={newCategory.video_url || ""}
              onChange={(url) => setNewCategory({ ...newCategory, video_url: url })}
              type="video"
            />
          </div>
          <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={newCategory.is_active ?? true}
              onChange={(e) =>
                setNewCategory({ ...newCategory, is_active: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-maroon focus:ring-maroon/20"
            />
            Active (visible on the storefront)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => saveCategory(newCategory, true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  </td>
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="px-2 py-1 border border-gray-200 rounded text-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          {category.tagline && (
                            <p className="text-sm text-gray-500">{category.tagline}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{category.slug}</td>
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={editForm.is_active ?? true}
                          onChange={(e) =>
                            setEditForm({ ...editForm, is_active: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-maroon focus:ring-maroon/20"
                        />
                        Active
                      </label>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          toggleCategoryActive(category.id, category.is_active)
                        }
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                          category.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        title={
                          category.is_active
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() => saveCategory(editForm)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(category.id);
                              setEditForm(category);
                            }}
                            className="p-2 text-gray-500 hover:text-maroon hover:bg-gray-100 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No categories yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
