"use client";

import { useState } from "react";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [revalidating, setRevalidating] = useState(false);

  async function revalidateCache(tags: string[]) {
    setRevalidating(true);
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      
      if (res.ok) {
        toast.success("Cache revalidated successfully");
      } else {
        throw new Error("Failed to revalidate");
      }
    } catch (error) {
      toast.error("Failed to revalidate cache");
    }
    setRevalidating(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage site settings and cache</p>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Cache Management</h2>
        <p className="text-sm text-gray-500">
          Revalidate cached data to see the latest changes on the frontend.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => revalidateCache(["products"])}
            disabled={revalidating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
          >
            Revalidate Products
          </button>
          <button
            onClick={() => revalidateCache(["categories"])}
            disabled={revalidating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
          >
            Revalidate Categories
          </button>
          <button
            onClick={() => revalidateCache(["reviews"])}
            disabled={revalidating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
          >
            Revalidate Reviews
          </button>
          <button
            onClick={() => revalidateCache(["home-config"])}
            disabled={revalidating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
          >
            Revalidate Home Config
          </button>
          <button
            onClick={() =>
              revalidateCache(["products", "categories", "reviews", "home-config"])
            }
            disabled={revalidating}
            className="px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50 text-sm font-medium col-span-2 md:col-span-1 flex items-center justify-center gap-2"
          >
            {revalidating && <RefreshCw className="h-4 w-4 animate-spin" />}
            Revalidate All
          </button>
        </div>
      </div>

      {/* Site Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Site Information</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Site Name</span>
            <span className="font-medium">Ethnoj</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Framework</span>
            <span className="font-medium">Next.js 15</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Database</span>
            <span className="font-medium">Supabase</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Environment</span>
            <span className="font-medium">
              {process.env.NODE_ENV === "production" ? "Production" : "Development"}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-500">
          These actions are irreversible. Please proceed with caution.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => toast.info("Feature coming soon")}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
          >
            Reset All Settings
          </button>
          <button
            onClick={() => toast.info("Feature coming soon")}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
