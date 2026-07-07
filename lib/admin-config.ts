import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { DBProduct } from "./database.types";

export interface HeroConfig {
  videoUrl: string;
  posterUrl: string;
  kicker: string;
  headline: string[];
  subheadline: string;
  primaryCta: { label: string; link: string };
  secondaryCta: { label: string; link: string };
}

export interface CarouselItem {
  id: string;
  category: string;
  label: string;
  tagline: string;
  videoUrl: string;
  posterUrl: string;
}

export interface CarouselConfig {
  kicker: string;
  title: string;
  items: CarouselItem[];
}

export interface FeaturedProductConfig {
  kicker: string;
  title: string;
  description: string;
  productId: string;
  videoUrl?: string;
  ctaLabel: string;
}

export interface FooterConfig {
  brand: { name: string; tagline: string };
  shopLinks: { label: string; href: string }[];
  helpLinks: { label: string; href: string }[];
  socialLinks: { platform: string; href: string }[];
  newsletterText: string;
  copyright: string;
}

export interface HomePageConfig {
  hero: HeroConfig;
  carousel: CarouselConfig;
  featuredProduct: FeaturedProductConfig;
  footer: FooterConfig;
}

const defaultConfig: HomePageConfig = {
  hero: {
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=80",
    kicker: "Festive Edit",
    headline: ["Woven", "in", "tradition"],
    subheadline: "Heirloom-worthy Indian ethnic wear, handcrafted by artisans.",
    primaryCta: { label: "Shop Now", link: "/products" },
    secondaryCta: { label: "Explore", link: "/products" },
  },
  carousel: {
    kicker: "Collections",
    title: "Shop by Category",
    items: [],
  },
  featuredProduct: {
    kicker: "Featured",
    title: "Featured Product",
    description: "Our most loved piece this season.",
    productId: "",
    videoUrl: "",
    ctaLabel: "View Details",
  },
  footer: {
    brand: {
      name: "Ethnoj",
      tagline: "Heirloom-worthy Indian ethnic wear.",
    },
    shopLinks: [
      { label: "All Products", href: "/products" },
    ],
    helpLinks: [
      { label: "Contact", href: "/contact" },
    ],
    socialLinks: [
      { platform: "instagram", href: "#" },
    ],
    newsletterText: "Subscribe for updates",
    copyright: "All rights reserved.",
  },
};

interface AdminConfigStore {
  config: HomePageConfig;
  isLoaded: boolean;
  featuredProduct: DBProduct | null;
  fetchConfig: () => Promise<void>;
  updateHero: (hero: Partial<HeroConfig>) => void;
  updateCarousel: (carousel: Partial<CarouselConfig>) => void;
  updateFeaturedProduct: (featured: Partial<FeaturedProductConfig>) => void;
  updateFooter: (footer: Partial<FooterConfig>) => void;
  getProductById: (id: string) => DBProduct | undefined;
}

export const useAdminConfig = create<AdminConfigStore>((set, get) => ({
  config: defaultConfig,
  isLoaded: false,
  featuredProduct: null,

  fetchConfig: async () => {
    const supabase = createClient();

    // Helper to filter out empty/null/undefined values from config
    const filterEmptyValues = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
      return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== "")
      ) as Partial<T>;
    };

    try {
      // Fetch all home_config from database
      const { data: configs } = await supabase
        .from("home_config")
        .select("*")
        .eq("is_active", true);

      if (configs && configs.length > 0) {
        const newConfig = { ...defaultConfig };

        configs.forEach((item) => {
          switch (item.section) {
            case "hero":
              if (item.config) newConfig.hero = { ...defaultConfig.hero, ...filterEmptyValues(item.config) };
              break;
            case "carousel":
              if (item.config) newConfig.carousel = { ...defaultConfig.carousel, ...filterEmptyValues(item.config) };
              break;
            case "featured":
              if (item.config) newConfig.featuredProduct = { ...defaultConfig.featuredProduct, ...filterEmptyValues(item.config) };
              break;
            case "footer":
              if (item.config) newConfig.footer = { ...defaultConfig.footer, ...filterEmptyValues(item.config) };
              break;
          }
        });

        // Fetch categories for carousel if not set
        if (newConfig.carousel.items.length === 0) {
          const { data: categories } = await supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

          if (categories) {
            newConfig.carousel.items = categories.map((cat) => ({
              id: cat.slug || cat.id,
              category: cat.slug || cat.id,
              label: cat.name,
              tagline: cat.tagline || cat.description || "",
              videoUrl: cat.video_url || "",
              posterUrl: cat.image || "",
            }));
          }
        }

        // Fetch featured product if productId is set
        let featuredProd: DBProduct | null = null;
        if (newConfig.featuredProduct.productId) {
          const { data: product } = await supabase
            .from("products")
            .select("*")
            .or(`slug.eq.${newConfig.featuredProduct.productId},id.eq.${newConfig.featuredProduct.productId}`)
            .eq("is_active", true)
            .single();

          if (product) {
            featuredProd = product;
          }
        }

        set({ config: newConfig, isLoaded: true, featuredProduct: featuredProd });
      } else {
        // No config in DB, fetch categories for carousel
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        const newConfig = { ...defaultConfig };
        if (categories) {
          newConfig.carousel.items = categories.map((cat) => ({
            id: cat.slug || cat.id,
            category: cat.slug || cat.id,
            label: cat.name,
            tagline: cat.tagline || cat.description || "",
            videoUrl: cat.video_url || "",
            posterUrl: cat.image || "",
          }));
        }

        set({ config: newConfig, isLoaded: true });
      }
    } catch (error) {
      console.error("Error fetching home config:", error);
      set({ isLoaded: true });
    }
  },

  updateHero: (hero) =>
    set((state) => ({
      config: { ...state.config, hero: { ...state.config.hero, ...hero } },
    })),

  updateCarousel: (carousel) =>
    set((state) => ({
      config: {
        ...state.config,
        carousel: { ...state.config.carousel, ...carousel },
      },
    })),

  updateFeaturedProduct: (featured) =>
    set((state) => ({
      config: {
        ...state.config,
        featuredProduct: { ...state.config.featuredProduct, ...featured },
      },
    })),

  updateFooter: (footer) =>
    set((state) => ({
      config: { ...state.config, footer: { ...state.config.footer, ...footer } },
    })),

  getProductById: (id) => {
    const state = get();
    if (state.featuredProduct && (state.featuredProduct.id === id || state.featuredProduct.slug === id)) {
      return state.featuredProduct;
    }
    return undefined;
  },
}));

// Auto-fetch config on module load (client-side only)
if (typeof window !== "undefined") {
  useAdminConfig.getState().fetchConfig();
}
