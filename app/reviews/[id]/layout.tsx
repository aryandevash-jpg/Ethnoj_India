import { createBuildClient } from "@/lib/supabase/build-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createBuildClient();

  if (!supabase) {
    return {
      title: "Review - Ethnoj",
      description: "Customer review at Ethnoj.",
    };
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .eq("is_approved", true)
    .single();

  if (!review) {
    return {
      title: "Review Not Found - Ethnoj",
      description: "This review could not be found.",
    };
  }

  const title = `Review by ${review.name} - Ethnoj`;
  const description = review.text.slice(0, 160) + (review.text.length > 160 ? "..." : "");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: review.image ? [{ url: review.image, width: 1200, height: 630 }] : [],
      siteName: "Ethnoj",
    },
    twitter: {
      card: review.image ? "summary_large_image" : "summary",
      title,
      description,
      images: review.image ? [review.image] : [],
    },
  };
}

export default function ReviewLayout({ children }: Props) {
  return <>{children}</>;
}
