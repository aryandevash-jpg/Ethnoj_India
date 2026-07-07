"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBProduct, DBCategory } from "@/lib/database.types";
import { toast } from "sonner";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

const defaultProduct: Partial<DBProduct> = {
  name: "",
  slug: "",
  category: "",
  price: 0,
  mrp: 0,
  image: "",
  hover_image: "",
  video_url: "",
  colors: [],
  sizes: [],
  description: "",
  short_description: "",
  is_featured: false,
  is_active: true,
  stock: 100,
  rating: 5,
  reviews_count: 0,
};

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const [product, setProduct] = useState<Partial<DBProduct>>(defaultProduct);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const categoriesPromise = supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      const productPromise = isNew
        ? Promise.resolve({ data: null, error: null })
        : supabase.from("products").select("*").eq("id", params.id).single();

      const [categoriesResult, productResult] = await Promise.all([
        categoriesPromise,
        productPromise,
      ]);

      if (categoriesResult.error) {
        toast.error("Failed to fetch categories");
        setLoading(false);
        return;
      }

      const fetchedCategories = categoriesResult.data || [];
      setCategories(fetchedCategories);

      const activeCategories = fetchedCategories.filter(
        (category) => category.is_active
      );

      if (!isNew) {
        if (productResult.error || !productResult.data) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }

        setProduct(productResult.data);
        setColorsInput(productResult.data.colors?.join(", ") || "");
        setSizesInput(productResult.data.sizes?.join(", ") || "");
      } else if (activeCategories.length > 0) {
        setProduct((current) => ({
          ...current,
          category: activeCategories[0].slug,
        }));
      }

      setLoading(false);
    }

    loadData();
  }, [isNew, params.id, router]);

  const activeCategories = categories.filter((category) => category.is_active);
  const selectableCategories = [
    ...activeCategories,
    ...categories.filter(
      (category) =>
        !category.is_active && category.slug === product.category
    ),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!product.category) {
      toast.error("Please select a category");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const productData = {
      name: product.name,
      slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, "-"),
      category: product.category,
      price: product.price,
      mrp: product.mrp || null,
      image: product.image,
      hover_image: product.hover_image || null,
      video_url: product.video_url || null,
      colors: colorsInput.split(",").map((c) => c.trim()).filter(Boolean),
      sizes: sizesInput.split(",").map((s) => s.trim()).filter(Boolean),
      description: product.description,
      short_description: product.short_description || null,
      is_featured: product.is_featured ?? false,
      is_active: product.is_active ?? true,
      stock: product.stock ?? 0,
      rating: product.rating ?? 5,
      reviews_count: product.reviews_count ?? 0,
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast.success("Product created");
      } else {
        const { error } = await supabase
          .from("products")
          .update({ ...productData, updated_at: new Date().toISOString() })
          .eq("id", params.id);
        if (error) throw error;
        toast.success("Product updated");
      }
      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            {isNew ? "Add Product" : "Edit Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isNew ? "Create a new product" : `Editing ${product.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={product.name || ""}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={product.slug || ""}
                onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                placeholder="auto-generated from name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={product.category || ""}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
                }
                disabled={selectableCategories.length === 0}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon disabled:bg-gray-50 disabled:text-gray-500"
              >
                {selectableCategories.length === 0 ? (
                  <option value="">No active categories available</option>
                ) : (
                  selectableCategories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                      {!category.is_active ? " (Inactive)" : ""}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {activeCategories.length > 0
                  ? `${activeCategories.length} active ${
                      activeCategories.length === 1 ? "category" : "categories"
                    } available`
                  : "Add an active category before creating products."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={product.stock || 0}
                onChange={(e) =>
                  setProduct({ ...product, stock: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={product.short_description || ""}
              onChange={(e) =>
                setProduct({ ...product, short_description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={product.description || ""}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                value={product.price || ""}
                onChange={(e) =>
                  setProduct({ ...product, price: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                value={product.mrp || ""}
                onChange={(e) =>
                  setProduct({ ...product, mrp: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Media</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CloudinaryUpload
              label="Main Image *"
              value={product.image || ""}
              onChange={(url) => setProduct({ ...product, image: url })}
              type="image"
            />

            <CloudinaryUpload
              label="Hover Image"
              value={product.hover_image || ""}
              onChange={(url) => setProduct({ ...product, hover_image: url })}
              type="image"
            />

            <div className="md:col-span-2">
              <CloudinaryUpload
                label="Product Video"
                value={product.video_url || ""}
                onChange={(url) => setProduct({ ...product, video_url: url })}
                type="video"
              />
              {product.video_url && (
                <p className="mt-2 text-sm text-green-700">
                  Video attached and will be shown on the product page.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Variants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors (comma separated)
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="Maroon, Navy, Cream"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sizes (comma separated)
              </label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="XS, S, M, L, XL"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={product.is_featured || false}
              onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 text-maroon focus:ring-maroon"
            />
            <div>
              <p className="font-medium text-gray-900">Featured Product</p>
              <p className="text-sm text-gray-500">
                Show this product in the featured section on homepage
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || activeCategories.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isNew ? "Create Product" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
