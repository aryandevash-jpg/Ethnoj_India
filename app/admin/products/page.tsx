"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Filter, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBProduct, DBCategory } from "@/lib/database.types";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  async function fetchData(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          setLoading(false);
          toast.error("Request taking too long. Please refresh.");
        }
      }, 10000);

      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
      ]);

      clearTimeout(timeoutId);
      if (signal?.aborted) return;

      if (productsResult.error) {
        console.error("Error fetching products:", productsResult.error);
        toast.error("Failed to fetch products");
      } else {
        setProducts(productsResult.data || []);
      }

      if (categoriesResult.error) {
        console.error("Error fetching categories:", categoriesResult.error);
        toast.error("Failed to fetch categories");
      } else {
        setCategories(categoriesResult.data || []);
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

  async function fetchProducts(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (signal?.aborted) return;

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Error:", error);
      toast.error("Connection error");
    }
  }

  function deleteProduct(id: string) {
    confirmToast("Are you sure you want to delete this product?", async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete product");
      } else {
        toast.success("Product deleted");
        setProducts(products.filter((p) => p.id !== id));
      }
    });
  }

  const categoryLabels = Object.fromEntries(
    categories.map((category) => [category.slug, category.name])
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon appearance-none bg-white"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Media
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Featured
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        {product.video_url && (
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-maroon p-1 text-white">
                            <Video className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.video_url ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        <Video className="h-3 w-3" />
                        Video
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Image only</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {categoryLabels[product.category] || product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </p>
                    {product.mrp && product.mrp > product.price && (
                      <p className="text-sm text-gray-400 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.is_featured && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gold/20 text-amber-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-gray-500 hover:text-maroon hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
