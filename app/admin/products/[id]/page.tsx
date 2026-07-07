"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBProduct, Category } from "@/lib/database.types";
import { toast } from "sonner";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

const categories: { value: Category; label: string }[] = [
  { value: "co-ord-sets", label: "Co-ord Sets" },
  { value: "kurtis", label: "Kurtis" },
  { value: "ladies-suits", label: "Ladies Suits" },
  { value: "sarees", label: "Sarees" },
  { value: "lehengas", label: "Lehengas" },
];

const defaultProduct: Partial<DBProduct> = {
  name: "",
  slug: "",
  category: "kurtis",
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
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");

  useEffect(() => {
    if (!isNew) {
      async function fetchProduct() {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          toast.error("Product not found");
          router.push("/admin/products");
        } else {
          setProduct(data);
          setColorsInput(data.colors?.join(", ") || "");
          setSizesInput(data.sizes?.join(", ") || "");
        }
        setLoading(false);
      }

      fetchProduct();
    }
  }, [params.id, isNew, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();

    const productData = {
      ...product,
      colors: colorsInput.split(",").map((c) => c.trim()).filter(Boolean),
      sizes: sizesInput.split(",").map((s) => s.trim()).filter(Boolean),
      slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, "-"),
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
                  setProduct({ ...product, category: e.target.value as Category })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
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
            disabled={saving}
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
