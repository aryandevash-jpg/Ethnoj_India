"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Star,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalReviews: number;
  pendingReviews: number;
  totalEnquiries: number;
  newEnquiries: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalReviews: 0,
    pendingReviews: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const [
          productsRes,
          ordersRes,
          pendingOrdersRes,
          reviewsRes,
          pendingReviewsRes,
          enquiriesRes,
          newEnquiriesRes,
          recentOrdersRes,
        ] = await Promise.all([
          supabase.from("products").select("id", { count: "exact" }).eq("is_active", true),
          supabase.from("orders").select("id", { count: "exact" }),
          supabase.from("orders").select("id", { count: "exact" }).eq("order_status", "pending"),
          supabase.from("reviews").select("id", { count: "exact" }),
          supabase.from("reviews").select("id", { count: "exact" }).eq("is_approved", false),
          supabase.from("enquiries").select("id", { count: "exact" }),
          supabase.from("enquiries").select("id", { count: "exact" }).eq("status", "new"),
          supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        ]);

        const revenueRes = await supabase
          .from("orders")
          .select("total")
          .eq("payment_status", "paid");

        const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        setStats({
          totalProducts: productsRes.count || 0,
          totalOrders: ordersRes.count || 0,
          pendingOrders: pendingOrdersRes.count || 0,
          totalReviews: reviewsRes.count || 0,
          pendingReviews: pendingReviewsRes.count || 0,
          totalEnquiries: enquiriesRes.count || 0,
          newEnquiries: newEnquiriesRes.count || 0,
          revenue: totalRevenue,
        });

        setRecentOrders(recentOrdersRes.data || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      subValue: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      label: "Reviews",
      value: stats.totalReviews,
      subValue: `${stats.pendingReviews} pending`,
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      label: "Enquiries",
      value: stats.totalEnquiries,
      subValue: `${stats.newEnquiries} new`,
      icon: MessageSquare,
      color: "bg-purple-500",
    },
    {
      label: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the Ethnoj admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-2 rounded-lg text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.subValue && (
                  <p className="text-xs text-orange-500 mt-0.5">{stat.subValue}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.order_status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.order_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.order_status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹{order.total?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.pendingReviews > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {stats.pendingReviews} reviews awaiting approval
              </p>
              <a href="/admin/reviews" className="text-sm text-yellow-600 hover:underline">
                Review now →
              </a>
            </div>
          </div>
        )}
        {stats.newEnquiries > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800">
                {stats.newEnquiries} new enquiries
              </p>
              <a href="/admin/enquiries" className="text-sm text-purple-600 hover:underline">
                View enquiries →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
