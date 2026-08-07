"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess?: (response: RazorpayResponse) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Failed to load payment gateway");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initiatePayment = useCallback(
    async (options: RazorpayOptions) => {
      if (!isLoaded) {
        toast.error("Payment gateway is loading. Please try again.");
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        toast.error("Payment gateway is not configured");
        return;
      }

      setIsProcessing(true);

      try {
        // Create order on server
        const orderResponse = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: options.amount,
            currency: options.currency || "INR",
            notes: options.notes,
          }),
        });

        if (!orderResponse.ok) {
          throw new Error("Failed to create order");
        }

        const orderData = await orderResponse.json();

        // Initialize Razorpay checkout
        const razorpayOptions = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: options.name || "Ethnoj",
          description: options.description || "Purchase",
          image: options.image || "/logo.png",
          order_id: orderData.id,
          prefill: options.prefill || {},
          notes: options.notes || {},
          theme: {
            color: "#722F37", // maroon color
          },
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment on server
              const verifyResponse = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });

              if (!verifyResponse.ok) {
                throw new Error("Payment verification failed");
              }

              const verifyData = await verifyResponse.json();
              
              if (verifyData.success) {
                toast.success("Payment successful!");
                options.onSuccess?.(response);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              toast.error("Payment verification failed. Please contact support.");
              options.onError?.(error);
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              options.onDismiss?.();
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();

        razorpay.on("payment.failed", (response: any) => {
          toast.error(response.error?.description || "Payment failed");
          options.onError?.(response.error);
          setIsProcessing(false);
        });
      } catch (error) {
        console.error("Payment initiation error:", error);
        toast.error("Failed to initiate payment. Please try again.");
        options.onError?.(error);
        setIsProcessing(false);
      }
    },
    [isLoaded]
  );

  return {
    isLoaded,
    isProcessing,
    initiatePayment,
  };
}
