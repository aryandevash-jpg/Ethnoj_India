"use client";

import { useEffect, useState } from "react";
import { Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBOrder } from "@/lib/database.types";
import { toast } from "sonner";

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock, color: "yellow" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle, color: "blue" },
  { value: "processing", label: "Processing", icon: Package, color: "indigo" },
  { value: "shipped", label: "Shipped", icon: Truck, color: "purple" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "green" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "red" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, []);

  async function fetchOrders(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          setLoading(false);
          toast.error("Request taking too long. Please refresh.");
        }
      }, 10000);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      clearTimeout(timeoutId);
      if (signal?.aborted) return;

      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
      } else {
        setOrders(data || []);
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

  async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Order status updated");
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: status as any });
      }
    }
  }

  const filteredOrders = orders.filter(
    (order) => !statusFilter || order.order_status === statusFilter
  );

  const getStatusColor = (status: string) => {
    const option = statusOptions.find((o) => o.value === status);
    return option?.color || "gray";
  };

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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
        >
          <option value="">All Orders</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedOrder?.id === order.id ? "bg-maroon/5" : ""
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(
                          order.order_status
                        )}-100 text-${getStatusColor(order.order_status)}-800`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₹{order.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-2 text-gray-500 hover:text-maroon hover:bg-gray-100 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedOrder ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Order {selectedOrder.order_number}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </h4>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder.id, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Customer</h4>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-gray-500">{selectedOrder.customer_email}</p>
                  <p className="text-gray-500">{selectedOrder.customer_phone}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Shipping Address
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p>{selectedOrder.shipping_address?.line1}</p>
                  {selectedOrder.shipping_address?.line2 && (
                    <p>{selectedOrder.shipping_address.line2}</p>
                  )}
                  <p>
                    {selectedOrder.shipping_address?.city},{" "}
                    {selectedOrder.shipping_address?.state}
                  </p>
                  <p>{selectedOrder.shipping_address?.pincode}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg p-2"
                    >
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>₹{selectedOrder.shipping?.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>₹{selectedOrder.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
