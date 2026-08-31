"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  Plus,
  Check,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Truck,
  AlertCircle,
  X,
  Edit2,
  Ticket,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR, useCart } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/shipping";
import { useAuth } from "@/hooks/use-auth";
import { useRazorpay } from "@/hooks/use-razorpay";
import { validateCoupon } from "@/hooks/use-coupons";
import type { DBUserProfile, DBUserAddress, OrderItem, DBProduct, CouponValidationResult } from "@/lib/database.types";

interface CheckoutItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  size: string;
  quantity: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items: cartItems,
    clear: clearCart,
    couponCode,
    appliedCoupon,
    setCouponCode,
    setAppliedCoupon,
    clearCoupon,
  } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoaded: isRazorpayLoaded, isProcessing, initiatePayment } = useRazorpay();

  // Buy Now params
  const buyNowProductId = searchParams.get("product");
  const buyNowSize = searchParams.get("size");
  const buyNowQty = parseInt(searchParams.get("qty") || "1");

  const [profile, setProfile] = useState<DBUserProfile | null>(null);
  const [addresses, setAddresses] = useState<DBUserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressConfirm, setShowAddressConfirm] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Buy Now product
  const [buyNowProduct, setBuyNowProduct] = useState<DBProduct | null>(null);
  const [buyNowLoading, setBuyNowLoading] = useState(!!buyNowProductId);

  // Inline forms
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [checkoutCouponCode, setCheckoutCouponCode] = useState("");
  const [checkoutCoupon, setCheckoutCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });

  // Determine checkout items based on mode
  const isBuyNow = !!buyNowProductId && !!buyNowProduct;
  
  const checkoutItems: CheckoutItem[] = isBuyNow
    ? [{
        product_id: buyNowProduct!.id,
        product_name: buyNowProduct!.name,
        product_image: buyNowProduct!.image,
        price: buyNowProduct!.price,
        size: buyNowSize || buyNowProduct!.sizes?.[0] || "Free Size",
        quantity: buyNowQty,
      }]
    : cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        price: item.product.price,
        size: item.size,
        quantity: item.qty,
      }));

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const activeCoupon = isBuyNow ? checkoutCoupon : appliedCoupon;
  const activeCouponCode = isBuyNow ? checkoutCouponCode : couponCode;
  const discount = activeCoupon?.valid ? (activeCoupon.calculated_discount || 0) : 0;
  const hasFreeShipping = activeCoupon?.valid && activeCoupon.free_shipping;
  const shippingFee =
    hasFreeShipping || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Fetch Buy Now product if applicable
  useEffect(() => {
    if (!buyNowProductId) return;

    const fetchBuyNowProduct = async () => {
      setBuyNowLoading(true);
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(buyNowProductId)}`);
        const json = await res.json();
        if (!res.ok || !json.data) {
          toast.error("Product not found");
          router.push("/products");
          return;
        }
        setBuyNowProduct(json.data);
      } catch {
        toast.error("Failed to load product");
        router.push("/products");
      } finally {
        setBuyNowLoading(false);
      }
    };

    fetchBuyNowProduct();
  }, [buyNowProductId, router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirectUrl = buyNowProductId 
        ? `/checkout?product=${buyNowProductId}&size=${buyNowSize || ""}&qty=${buyNowQty}`
        : "/checkout";
      router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectUrl)}`);
    }
  }, [authLoading, isAuthenticated, router, buyNowProductId, buyNowSize, buyNowQty]);

  useEffect(() => {
    if (!isBuyNow && cartItems.length === 0 && !isLoading && !buyNowLoading) {
      router.push("/products");
    }
  }, [cartItems, isLoading, router, isBuyNow, buyNowLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      const [profileRes, addressesRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/addresses"),
      ]);

      const profileData = await profileRes.json();
      const addressesData = await addressesRes.json();

      if (profileData.profile) {
        setProfile(profileData.profile);
        setProfileForm({
          full_name: profileData.profile.full_name || "",
          phone: profileData.profile.phone || "",
        });
      }

      if (addressesData.addresses) {
        setAddresses(addressesData.addresses);
        const defaultAddr = addressesData.addresses.find((a: DBUserAddress) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setShowAddressConfirm(true);
        }
      }
    } catch {
      toast.error("Failed to load your details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.full_name || !addressForm.phone || !addressForm.address_line1 || 
        !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      if (!res.ok) throw new Error("Failed to save address");

      const data = await res.json();
      const newAddress = data.address;
      
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setAddressForm({
        label: "Home",
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      toast.success("Address saved successfully");
    } catch {
      toast.error("Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.full_name) {
      toast.error("Please enter your name");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const data = await res.json();
      setProfile(data.profile);
      setShowProfileForm(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (isBuyNow) return;
    setCheckoutCouponCode(couponCode);
    setCheckoutCoupon(appliedCoupon);
  }, [isBuyNow, couponCode, appliedCoupon]);

  const handleApplyCheckoutCoupon = async () => {
    const code = (isBuyNow ? checkoutCouponCode : couponCode).trim();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsValidatingCoupon(true);
    const result = await validateCoupon(code, subtotal, profile?.email);
    setIsValidatingCoupon(false);
    if (result.valid) {
      if (isBuyNow) {
        setCheckoutCoupon(result);
        setCheckoutCouponCode(code);
      } else {
        setAppliedCoupon(result);
        setCouponCode(code);
      }
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveCheckoutCoupon = () => {
    if (isBuyNow) {
      setCheckoutCoupon(null);
      setCheckoutCouponCode("");
    } else {
      clearCoupon();
    }
    toast("Coupon removed");
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select or add a delivery address");
      return;
    }

    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    if (!isRazorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    setIsCreatingOrder(true);

    try {
      const orderItems: OrderItem[] = checkoutItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        size: item.size,
        quantity: item.quantity,
        price: item.price * item.quantity,
      }));

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: selectedAddress.full_name,
          customer_phone: selectedAddress.phone,
          shipping_address: {
            line1: selectedAddress.address_line1,
            line2: selectedAddress.address_line2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            country: selectedAddress.country || "India",
          },
          items: orderItems,
          subtotal,
          shipping: shippingFee,
          discount,
          total,
          coupon_code: activeCoupon?.valid ? activeCouponCode : undefined,
          coupon_discount: discount,
          payment_method: "razorpay",
        }),
      });

      const orderJson = await orderRes.json();
      const order = orderJson.data;

      if (!orderRes.ok || !order) {
        throw new Error(orderJson.error || "Failed to create order");
      }

      initiatePayment({
        amount: total,
        description: `Order #${order.order_number}`,
        prefill: {
          name: selectedAddress.full_name,
          email: profile.email,
          contact: selectedAddress.phone,
        },
        notes: {
          order_id: order.id,
          order_number: order.order_number,
        },
        onSuccess: () => {
          if (!isBuyNow) {
            clearCart();
          } else {
            clearCoupon();
          }
          toast.success("Order placed successfully!");
          router.push("/account/orders");
        },
        onError: () => {
          toast.error("Payment failed. Please try again.");
        },
        onDismiss: () => {
          toast("Payment cancelled. Your order is saved as pending.");
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout. Please try again.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (authLoading || isLoading || buyNowLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gold/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-ink mb-2">Nothing to checkout</h2>
          <p className="text-ink/60 mb-6">Add some items to proceed</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-maroon text-cream rounded-full font-medium hover:bg-maroon-deep transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-maroon transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="font-display text-3xl text-ink">Checkout</h1>
          {isBuyNow && (
            <p className="text-sm text-maroon mt-1">Buying: {buyNowProduct?.name}</p>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left Column - Address & Details */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-soft border border-gold/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-maroon" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      Delivery Address
                    </h2>
                    <p className="text-sm text-ink/60">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-sm text-maroon hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add New
                  </button>
                )}
              </div>

              {/* Inline Address Form */}
              <AnimatePresence>
                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-cream/50 rounded-xl p-4 border border-gold/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-ink">Add New Address</h3>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="text-ink/50 hover:text-ink"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-ink/70 mb-1">Label</label>
                            <select
                              value={addressForm.label}
                              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                              className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                            >
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-ink/70 mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={addressForm.full_name}
                              onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                              className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                              placeholder="Full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-ink/70 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                            placeholder="10-digit mobile number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-ink/70 mb-1">Address Line 1 *</label>
                          <input
                            type="text"
                            value={addressForm.address_line1}
                            onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                            className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                            placeholder="House/Flat No., Building, Street"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-ink/70 mb-1">Address Line 2</label>
                          <input
                            type="text"
                            value={addressForm.address_line2}
                            onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                            className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                            placeholder="Landmark, Area (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-ink/70 mb-1">City *</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-ink/70 mb-1">State *</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-ink/70 mb-1">Pincode *</label>
                            <input
                              type="text"
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                              placeholder="Pincode"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                            className="h-4 w-4 rounded border-gold/40 text-maroon focus:ring-maroon"
                          />
                          <span className="text-sm text-ink/70">Set as default address</span>
                        </label>

                        <button
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress}
                          className="w-full py-3 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSavingAddress ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Save Address
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {addresses.length === 0 && !showAddressForm ? (
                <div className="text-center py-8 border-2 border-dashed border-gold/30 rounded-xl">
                  <MapPin className="h-10 w-10 text-gold/40 mx-auto mb-3" />
                  <p className="text-ink/60 mb-4">No saved addresses</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-cream rounded-lg text-sm font-medium hover:bg-maroon-deep transition"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Address Confirmation Banner */}
                  <AnimatePresence>
                    {showAddressConfirm && selectedAddress && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald/10 border border-emerald/30 rounded-xl p-4 mb-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-emerald">
                              Confirm delivery address
                            </p>
                            <p className="text-sm text-emerald/80 mt-1">
                              Delivering to: {selectedAddress.address_line1}, {selectedAddress.city}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => setShowAddressConfirm(false)}
                                className="px-3 py-1.5 bg-emerald text-white rounded-lg text-sm font-medium hover:bg-emerald/90 transition"
                              >
                                Yes, deliver here
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddressConfirm(false);
                                  setSelectedAddressId(null);
                                }}
                                className="px-3 py-1.5 border border-emerald/30 text-emerald rounded-lg text-sm font-medium hover:bg-emerald/10 transition"
                              >
                                Change address
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {addresses.map((address) => (
                    <motion.button
                      key={address.id}
                      onClick={() => {
                        setSelectedAddressId(address.id);
                        setShowAddressConfirm(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        selectedAddressId === address.id
                          ? "border-maroon bg-maroon/5"
                          : "border-gold/30 hover:border-maroon/50"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-ink">
                              {address.full_name}
                            </span>
                            <span className="px-2 py-0.5 bg-cream-deep rounded text-xs text-ink/60">
                              {address.label}
                            </span>
                            {address.is_default && (
                              <span className="px-2 py-0.5 bg-maroon/10 text-maroon rounded text-xs">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ink/70">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-ink/70">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-ink/60 mt-1">{address.phone}</p>
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === address.id
                              ? "border-maroon bg-maroon"
                              : "border-gold/40"
                          }`}
                        >
                          {selectedAddressId === address.id && (
                            <Check className="h-4 w-4 text-cream" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-soft border border-gold/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-maroon" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      Contact Information
                    </h2>
                  </div>
                </div>
                {!showProfileForm && (
                  <button
                    onClick={() => setShowProfileForm(true)}
                    className="text-sm text-maroon hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              {/* Inline Profile Form */}
              <AnimatePresence>
                {showProfileForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="bg-cream/50 rounded-xl p-4 border border-gold/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-ink">Edit Profile</h3>
                        <button
                          onClick={() => setShowProfileForm(false)}
                          className="text-ink/50 hover:text-ink"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm text-ink/70 mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                            placeholder="Your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-ink/70 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full h-10 rounded-lg border border-gold/30 bg-white px-3 text-sm focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                            placeholder="10-digit mobile number"
                          />
                        </div>

                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="w-full py-3 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Save Profile
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-ink/60">Name</label>
                  <p className="font-medium text-ink">
                    {selectedAddress?.full_name || profile?.full_name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-ink/60">Email</label>
                  <p className="font-medium text-ink">{profile?.email || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-ink/60">Phone</label>
                  <p className="font-medium text-ink">
                    {selectedAddress?.phone || profile?.phone || "-"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-8 space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-soft border border-gold/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-maroon" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Order Summary
                  </h2>
                  <p className="text-sm text-ink/60">
                    {checkoutItems.length} item{checkoutItems.length !== 1 ? "s" : ""}
                    {isBuyNow && " (Buy Now)"}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {checkoutItems.map((item, index) => (
                  <div
                    key={`${item.product_id}-${item.size}-${index}`}
                    className="flex gap-3"
                  >
                    <div className="h-20 w-16 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-ink text-sm truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-ink/60">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-maroon mt-1">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 space-y-2">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <Ticket className="h-4 w-4" />
                  Have a coupon?
                </label>
                {activeCoupon?.valid ? (
                  <div className="flex items-center justify-between rounded-lg bg-emerald/10 px-3 py-2 border border-emerald/30">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald" />
                      <span className="text-sm font-medium text-emerald">
                        {activeCouponCode.toUpperCase()}
                      </span>
                      {hasFreeShipping ? (
                        <span className="text-xs text-emerald/80">Free Shipping!</span>
                      ) : (
                        <span className="text-xs text-emerald/80">-{formatINR(discount)}</span>
                      )}
                    </div>
                    <button
                      onClick={handleRemoveCheckoutCoupon}
                      className="text-emerald/70 hover:text-emerald"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={isBuyNow ? checkoutCouponCode : couponCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (isBuyNow) setCheckoutCouponCode(value);
                        else setCouponCode(value);
                      }}
                      placeholder="Enter code"
                      className="flex-1 h-10 rounded-lg border border-gold/30 bg-card px-3 text-sm uppercase placeholder:normal-case focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCheckoutCoupon()}
                    />
                    <button
                      onClick={handleApplyCheckoutCoupon}
                      disabled={isValidatingCoupon || !(isBuyNow ? checkoutCouponCode : couponCode).trim()}
                      className="px-4 h-10 rounded-lg bg-cream-deep text-sm font-medium text-ink hover:bg-gold/20 transition disabled:opacity-50"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gold/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/70">Subtotal</span>
                  <span className="text-ink">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald">Coupon Discount</span>
                    <span className="text-emerald">-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-ink/70 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Shipping
                  </span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald">Free</span>
                  ) : (
                    <span className="text-ink">{formatINR(shippingFee)}</span>
                  )}
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-ink/50">
                    Free shipping on orders above {formatINR(FREE_SHIPPING_THRESHOLD)}
                  </p>
                )}
                <div className="flex justify-between pt-3 border-t border-gold/20">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-display text-xl text-maroon">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={
                  !selectedAddressId ||
                  isProcessing ||
                  isCreatingOrder ||
                  !isRazorpayLoaded
                }
                className="w-full mt-6 py-4 bg-maroon text-cream rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-maroon-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing || isCreatingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay {formatINR(total)}
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {!selectedAddressId && (
                <p className="text-center text-sm text-ink/50 mt-3">
                  Please select or add a delivery address
                </p>
              )}
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-ink/50">
              <Check className="h-4 w-4 text-emerald" />
              Secure payment powered by Razorpay
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
