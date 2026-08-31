import type { DBProduct } from "@/lib/database.types";
import type { Product } from "@/lib/products";

export const dbProductToCartProduct = (product: DBProduct): Product => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: product.price,
  mrp: product.mrp || product.price,
  image: product.image,
  hoverImage: product.hover_image || product.image,
  videoUrl: product.video_url || undefined,
  category: product.category as Product["category"],
  colors: product.colors || [],
  sizes: product.sizes || [],
  description: product.description || "",
  rating: product.rating || 0,
  reviews: product.reviews_count || 0,
});
