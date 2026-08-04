"use client";

import { useState, useEffect, useCallback } from "react";
import type { DBCoupon, CouponValidationResult } from "@/lib/database.types";

export function useCoupons() {
  const [coupons, setCoupons] = useState<DBCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/coupons");
      const data = await res.json();
      
      if (data.coupons) {
        setCoupons(data.coupons);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch coupons");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = async (couponData: Partial<DBCoupon>) => {
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(couponData),
    });
    const data = await res.json();
    
    if (data.success) {
      await fetchCoupons();
      return { success: true, coupon: data.coupon };
    }
    return { success: false, error: data.error };
  };

  const updateCoupon = async (id: string, updates: Partial<DBCoupon>) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    
    if (data.success) {
      await fetchCoupons();
      return { success: true, coupon: data.coupon };
    }
    return { success: false, error: data.error };
  };

  const deleteCoupon = async (id: string) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    
    if (data.success) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  return {
    coupons,
    isLoading,
    error,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
}

export async function validateCoupon(
  code: string,
  orderTotal: number,
  userEmail?: string
): Promise<CouponValidationResult> {
  try {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderTotal, userEmail }),
    });
    return await res.json();
  } catch {
    return { valid: false, message: "Failed to validate coupon" };
  }
}

export async function applyCoupon(
  couponId: string,
  orderId: string,
  userEmail: string,
  discountAmount: number
) {
  try {
    const res = await fetch("/api/coupons/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId, orderId, userEmail, discountAmount }),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to apply coupon" };
  }
}
