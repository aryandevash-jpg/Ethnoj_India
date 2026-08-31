"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Package, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { AccountSidebar } from "@/components/AccountSidebar";
import { formatINR } from "@/lib/cart";
import type { DBUserProfile, DBOrder } from "@/lib/database.types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald/10 text-emerald",
  cancelled: "bg-destructive/10 text-destructive",
};

const paymentStatusColors: Record<string, string> = {
  pending: "text-yellow-600",
  paid: "text-emerald",
  failed: "text-destructive",
  refunded: "text-blue-600",
};

export default function OrdersPage() {
  const [profile, setProfile] = useState<DBUserProfile | null>(null);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/orders"),
      ]);

      const profileData = await profileRes.json();
      const ordersData = await ordersRes.json();

      if (profileData.profile) setProfile(profileData.profile);
      if (ordersData.orders) setOrders(ordersData.orders);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl text-ink">My Account</h1>
          <p className="text-ink/60 mt-1">Track and manage your orders</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AccountSidebar
              userName={profile?.full_name}
              userEmail={profile?.email}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-soft border border-gold/20 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-maroon" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    My Orders
                  </h2>
                  <p className="text-sm text-ink/60">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="font-medium text-ink mb-2">No orders yet</h3>
                  <p className="text-sm text-ink/60 mb-4">
                    Start shopping to see your orders here
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gold/30 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedOrder(
                            expandedOrder === order.id ? null : order.id
                          )
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-cream-deep/50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-cream-deep flex items-center justify-center overflow-hidden">
                            {order.items[0] && (
                              <Image
                                src={order.items[0].product_image}
                                alt={order.items[0].product_name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-ink text-sm">
                              Order #{order.order_number}
                            </p>
                            <p className="text-xs text-ink/60">
                              {format(
                                new Date(order.created_at),
                                "MMM d, yyyy"
                              )}{" "}
                              • {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-maroon text-sm">
                              {formatINR(Number(order.total))}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                statusColors[order.order_status] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </div>
                          <ChevronRight
                            className={`h-5 w-5 text-ink/30 transition-transform ${
                              expandedOrder === order.id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gold/20 p-4 bg-cream/30"
                        >
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="text-xs uppercase tracking-wide text-ink/60 mb-2">
                                Items
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex gap-3">
                                    <div className="h-16 w-12 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                                      <Image
                                        src={item.product_image}
                                        alt={item.product_name}
                                        width={48}
                                        height={64}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-ink text-sm truncate">
                                        {item.product_name}
                                      </p>
                                      <p className="text-xs text-ink/60">
                                        Size: {item.size} • Qty: {item.quantity}
                                      </p>
                                      <p className="text-sm font-medium text-maroon">
                                        {formatINR(Number(item.price))}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs uppercase tracking-wide text-ink/60 mb-2">
                                Delivery Address
                              </h4>
                              <div className="text-sm text-ink/80">
                                <p className="font-medium">{order.customer_name}</p>
                                <p>{order.shipping_address.line1}</p>
                                {order.shipping_address.line2 && (
                                  <p>{order.shipping_address.line2}</p>
                                )}
                                <p>
                                  {order.shipping_address.city},{" "}
                                  {order.shipping_address.state} -{" "}
                                  {order.shipping_address.pincode}
                                </p>
                                <p className="mt-1">{order.customer_phone}</p>
                              </div>

                              <h4 className="text-xs uppercase tracking-wide text-ink/60 mt-4 mb-2">
                                Payment
                              </h4>
                              <p
                                className={`text-sm font-medium capitalize ${
                                  paymentStatusColors[order.payment_status]
                                }`}
                              >
                                {order.payment_status}
                                {order.payment_method &&
                                  ` via ${order.payment_method}`}
                              </p>

                              <div className="mt-4 pt-4 border-t border-gold/20">
                                <div className="flex justify-between text-sm">
                                  <span className="text-ink/60">Subtotal</span>
                                  <span>{formatINR(Number(order.subtotal))}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-ink/60">Discount</span>
                                    <span className="text-emerald">
                                      -{formatINR(Number(order.discount))}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm">
                                  <span className="text-ink/60">Shipping</span>
                                  <span>
                                    {Number(order.shipping) === 0
                                      ? "Free"
                                      : formatINR(Number(order.shipping))}
                                  </span>
                                </div>
                                <div className="flex justify-between font-semibold text-ink mt-2 pt-2 border-t border-gold/20">
                                  <span>Total</span>
                                  <span>{formatINR(Number(order.total))}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
