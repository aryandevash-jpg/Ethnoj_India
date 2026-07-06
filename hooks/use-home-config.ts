"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface HeroConfig {
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
}

interface FeaturedConfig {
  productId: string;
  badge: string;
  heading: string;
  subheading: string;
}

interface FooterConfig {
  tagline: string;
  email: string;
  phone: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  pinterestUrl: string;
}

interface HomeConfig {
  hero?: HeroConfig;
  featured?: FeaturedConfig;
  footer?: FooterConfig;
}

export function useHomeConfig() {
  const [config, setConfig] = useState<HomeConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const supabase = createClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("home_config")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;

        const configMap: HomeConfig = {};
        data?.forEach((item) => {
          if (item.section === "hero") configMap.hero = item.config as HeroConfig;
          if (item.section === "featured")
            configMap.featured = item.config as FeaturedConfig;
          if (item.section === "footer")
            configMap.footer = item.config as FooterConfig;
        });

        setConfig(configMap);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching home config:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading, error };
}
