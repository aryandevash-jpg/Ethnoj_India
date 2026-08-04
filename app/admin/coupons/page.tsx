"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Percent,
  IndianRupee,
  Truck,
  Calendar,
  Users,
  Copy,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCoupons } from "@/hooks/use-coupons";
import type { DBCoupon, CouponDiscountType } from "@/lib/database.types";

interface CouponFormData {
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_discount: number | null;
  min_order_value: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const initialFormData: CouponFormData = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  max_discount: null,
  min_order_value: 0,
  usage_limit: null,
  usage_limit_per_user: 1,
  starts_at: new Date().toISOString().split("T")[0],
  expires_at: "",
  is_active: true,
};

const discountTypes = [
  { value: "percentage", label: "Percentage Off", icon: Percent },
  { value: "flat", label: "Flat Discount", icon: IndianRupee },
  { value: "free_shipping", label: "Free Shipping", icon: Truck },
];

export default function CouponsPage() {
  const { coupons, isLoading, createCoupon, updateCoupon, deleteCoupon } =
    useCoupons();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        starts_at: formData.starts_at
          ? new Date(formData.starts_at).toISOString()
          : new Date().toISOString(),
        expires_at: formData.expires_at
          ? new Date(formData.expires_at + "T23:59:59").toISOString()
          : null,
        max_discount:
          formData.discount_type === "percentage" ? formData.max_discount : null,
        discount_value:
          formData.discount_type === "free_shipping" ? 0 : formData.discount_value,
      };

      const result = editingId
        ? await updateCoupon(editingId, payload)
        : await createCoupon(payload);

      if (result.success) {
        toast.success(editingId ? "Coupon updated" : "Coupon created");
        resetForm();
      } else {
        toast.error(result.error || "Failed to save coupon");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (coupon: DBCoupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount ?? null,
      min_order_value: coupon.min_order_value,
      usage_limit: coupon.usage_limit ?? null,
      usage_limit_per_user: coupon.usage_limit_per_user ?? null,
      starts_at: coupon.starts_at.split("T")[0],
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    const result = await deleteCoupon(id);
    if (result.success) {
      toast.success("Coupon deleted");
    } else {
      toast.error(result.error || "Failed to delete coupon");
    }
  };

  const handleToggleActive = async (coupon: DBCoupon) => {
    const result = await updateCoupon(coupon.id, {
      is_active: !coupon.is_active,
    });
    if (result.success) {
      toast.success(coupon.is_active ? "Coupon deactivated" : "Coupon activated");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const getDiscountDisplay = (coupon: DBCoupon) => {
    switch (coupon.discount_type) {
      case "percentage":
        return (
          <span>
            {coupon.discount_value}% off
            {coupon.max_discount && (
              <span className="text-xs text-gray-500 ml-1">
                (max ₹{coupon.max_discount})
              </span>
            )}
          </span>
        );
      case "flat":
        return <span>₹{coupon.discount_value} off</span>;
      case "free_shipping":
        return <span>Free Shipping</span>;
    }
  };

  const getStatusBadge = (coupon: DBCoupon) => {
    const now = new Date();
    const startsAt = new Date(coupon.starts_at);
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (!coupon.is_active) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
          Inactive
        </span>
      );
    }
    if (startsAt > now) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
          Scheduled
        </span>
      );
    }
    if (expiresAt && expiresAt < now) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
          Expired
        </span>
      );
    }
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
          Limit Reached
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
        Active
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage discount coupons and promotions
          </p>
        </div>
        {!showForm && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., SAVE20"
                    required
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm uppercase focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., 20% off on all products"
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Discount Type *
                </label>
                <div className="flex flex-wrap gap-3">
                  {discountTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          discount_type: value as CouponDiscountType,
                        })
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                        formData.discount_type === value
                          ? "border-maroon bg-maroon/5 text-maroon"
                          : "border-gray-300 hover:border-maroon/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.discount_type !== "free_shipping" && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {formData.discount_type === "percentage"
                        ? "Discount Percentage *"
                        : "Discount Amount (₹) *"}
                    </label>
                    <div className="relative">
                      {formData.discount_type === "percentage" ? (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      ) : (
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      )}
                      <input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_value: parseFloat(e.target.value) || 0,
                          })
                        }
                        min={0}
                        max={formData.discount_type === "percentage" ? 100 : undefined}
                        required
                        className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                      />
                    </div>
                  </div>

                  {formData.discount_type === "percentage" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Maximum Discount (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.max_discount || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              max_discount: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          min={0}
                          placeholder="No limit"
                          className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum Order Value (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.min_order_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_order_value: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Total Usage Limit
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.usage_limit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usage_limit: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      min={1}
                      placeholder="Unlimited"
                      className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Usage Per User
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit_per_user || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usage_limit_per_user: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    min={1}
                    placeholder="Unlimited"
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.starts_at}
                      onChange={(e) =>
                        setFormData({ ...formData, starts_at: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) =>
                        setFormData({ ...formData, expires_at: e.target.value })
                      }
                      min={formData.starts_at}
                      placeholder="No expiry"
                      className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-maroon focus:ring-maroon/20"
                />
                <span className="text-sm text-gray-700">
                  Coupon is active and can be used
                </span>
              </label>

              <div className="flex gap-3 pt-4 border-t">
                <motion.button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </motion.button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No coupons yet
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Create your first coupon to offer discounts to customers
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {coupon.discount_type === "percentage" && (
                          <Percent className="h-4 w-4 text-maroon" />
                        )}
                        {coupon.discount_type === "flat" && (
                          <IndianRupee className="h-4 w-4 text-maroon" />
                        )}
                        {coupon.discount_type === "free_shipping" && (
                          <Truck className="h-4 w-4 text-maroon" />
                        )}
                        <span className="text-sm font-medium">
                          {getDiscountDisplay(coupon)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {coupon.min_order_value > 0
                        ? `₹${coupon.min_order_value.toLocaleString()}`
                        : "None"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div>
                        {coupon.times_used}
                        {coupon.usage_limit
                          ? ` / ${coupon.usage_limit}`
                          : " used"}
                      </div>
                      {coupon.usage_limit_per_user && (
                        <div className="text-xs text-gray-400">
                          {coupon.usage_limit_per_user} per user
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div>
                        {format(new Date(coupon.starts_at), "MMM d, yyyy")}
                      </div>
                      {coupon.expires_at ? (
                        <div className="text-xs text-gray-400">
                          to {format(new Date(coupon.expires_at), "MMM d, yyyy")}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">No expiry</div>
                      )}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(coupon)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`p-1.5 rounded-lg transition ${
                            coupon.is_active
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={coupon.is_active ? "Deactivate" : "Activate"}
                        >
                          {coupon.is_active ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-1.5 text-gray-400 hover:text-maroon hover:bg-maroon/5 rounded-lg transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
