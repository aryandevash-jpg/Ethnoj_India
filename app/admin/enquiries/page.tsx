"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Mail, Phone, Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBEnquiry } from "@/lib/database.types";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<DBEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    fetchEnquiries(controller.signal);
    return () => controller.abort();
  }, []);

  async function fetchEnquiries(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          setLoading(false);
          toast.error("Request taking too long. Please refresh.");
        }
      }, 10000);

      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      clearTimeout(timeoutId);
      if (signal?.aborted) return;

      if (error) {
        console.error("Error fetching enquiries:", error);
        toast.error("Failed to fetch enquiries");
      } else {
        setEnquiries(data || []);
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

  async function updateStatus(id: string, status: "contacted" | "resolved") {
    const supabase = createClient();

    const { error } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchEnquiries();
    }
  }

  function deleteEnquiry(id: string) {
    confirmToast("Are you sure you want to delete this enquiry?", async () => {
      const supabase = createClient();

      const { error } = await supabase.from("enquiries").delete().eq("id", id);

      if (error) {
        toast.error("Failed to delete enquiry");
      } else {
        toast.success("Enquiry deleted");
        fetchEnquiries();
      }
    });
  }

  const filteredEnquiries = enquiries.filter(
    (e) => !filter || e.status === filter
  );

  const newCount = enquiries.filter((e) => e.status === "new").length;

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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Enquiries</h1>
          <p className="text-gray-500 mt-1">
            Customer enquiries and messages
            {newCount > 0 && (
              <span className="ml-2 text-orange-500">
                ({newCount} new)
              </span>
            )}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
        >
          <option value="">All Enquiries</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredEnquiries.map((enquiry) => (
          <div
            key={enquiry.id}
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              enquiry.status === "new" ? "border-orange-200" : "border-gray-100"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{enquiry.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          enquiry.status === "new"
                            ? "bg-orange-100 text-orange-800"
                            : enquiry.status === "contacted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {enquiry.email}
                      </span>
                      {enquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {enquiry.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(enquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {enquiry.status === "new" && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "contacted")}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {enquiry.status !== "resolved" && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "resolved")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Mark Resolved"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteEnquiry(enquiry.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{enquiry.message}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEnquiries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No enquiries found</p>
        </div>
      )}
    </div>
  );
}
