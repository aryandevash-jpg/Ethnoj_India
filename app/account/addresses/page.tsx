"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Home,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { AccountSidebar } from "@/components/AccountSidebar";
import type { DBUserAddress, DBUserProfile } from "@/lib/database.types";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

interface AddressFormData {
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const initialFormData: AddressFormData = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export default function AddressesPage() {
  const [profile, setProfile] = useState<DBUserProfile | null>(null);
  const [addresses, setAddresses] = useState<DBUserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, addressesRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/addresses"),
      ]);
      
      const profileData = await profileRes.json();
      const addressesData = await addressesRes.json();
      
      if (profileData.profile) setProfile(profileData.profile);
      if (addressesData.addresses) setAddresses(addressesData.addresses);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingId
        ? `/api/user/addresses/${editingId}`
        : "/api/user/addresses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Address updated" : "Address added");
        fetchData();
        resetForm();
      } else {
        toast.error(data.error || "Failed to save address");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: DBUserAddress) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Address deleted");
        setAddresses(addresses.filter((a) => a.id !== id));
      } else {
        toast.error("Failed to delete address");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
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
          <p className="text-ink/60 mt-1">Manage your saved addresses</p>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-maroon" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Saved Addresses
                    </h2>
                    <p className="text-sm text-ink/60">
                      {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
                    </p>
                  </div>
                </div>

                {!showForm && (
                  <motion.button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-4 w-4" />
                    Add New
                  </motion.button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {showForm ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5 border-b border-gold/20 pb-6 mb-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-ink">
                        {editingId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-ink/50 hover:text-ink transition"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {[
                        { value: "Home", icon: Home },
                        { value: "Work", icon: Briefcase },
                      ].map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, label: value })
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                            formData.label === value
                              ? "border-maroon bg-maroon/5 text-maroon"
                              : "border-gold/30 hover:border-maroon/50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {value}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-ink/80">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData({ ...formData, full_name: e.target.value })
                          }
                          required
                          className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-ink/80">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                          className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-ink/80">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) =>
                          setFormData({ ...formData, address_line1: e.target.value })
                        }
                        placeholder="House no., Building, Street"
                        required
                        className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-ink/80">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) =>
                          setFormData({ ...formData, address_line2: e.target.value })
                        }
                        placeholder="Landmark, Area (Optional)"
                        className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-ink/80">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          required
                          className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-ink/80">
                          State *
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          required
                          className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-ink/80">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) =>
                            setFormData({ ...formData, pincode: e.target.value })
                          }
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                          className="h-11 w-full rounded-lg border border-gold/30 bg-cream/50 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) =>
                          setFormData({ ...formData, is_default: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gold/30 text-maroon focus:ring-maroon/20"
                      />
                      <span className="text-sm text-ink/70">
                        Set as default address
                      </span>
                    </label>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {isSaving ? "Saving..." : "Save Address"}
                      </motion.button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-gold/30 rounded-lg font-medium text-sm text-ink/70 hover:bg-cream-deep transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                ) : null}
              </AnimatePresence>

              {addresses.length === 0 && !showForm ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="font-medium text-ink mb-2">No addresses saved</h3>
                  <p className="text-sm text-ink/60 mb-4">
                    Add an address for faster checkout
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((address, index) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 rounded-xl border ${
                        address.is_default
                          ? "border-maroon bg-maroon/5"
                          : "border-gold/30"
                      }`}
                    >
                      {address.is_default && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-maroon text-cream text-xs rounded-full">
                          Default
                        </span>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        {address.label === "Work" ? (
                          <Briefcase className="h-4 w-4 text-maroon" />
                        ) : (
                          <Home className="h-4 w-4 text-maroon" />
                        )}
                        <span className="font-medium text-sm text-ink">
                          {address.label}
                        </span>
                      </div>

                      <p className="font-medium text-ink">{address.full_name}</p>
                      <p className="text-sm text-ink/70 mt-1">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </p>
                      <p className="text-sm text-ink/70">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-ink/70 mt-1">{address.phone}</p>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(address)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-maroon hover:bg-maroon/10 rounded-lg transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
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
