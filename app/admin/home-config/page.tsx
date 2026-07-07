"use client";

import { useEffect, useState, useRef } from "react";
import { Save, Loader2, Home, Image as ImageIcon, Video, Type, Instagram, Plus, Trash2, ExternalLink, ChevronDown, Check, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import type { DBProduct } from "@/lib/database.types";

interface HeroConfig {
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
}

interface CarouselItem {
  id: string;
  label: string;
  tagline: string;
  image: string;
  videoUrl?: string;
}

interface FeaturedConfig {
  productId: string;
  kicker: string;
  title: string;
  description: string;
  ctaLabel: string;
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

interface InstagramPost {
  id: string;
  imageUrl: string;
  postUrl: string;
  caption?: string;
}

interface InstagramConfig {
  handle: string;
  posts: InstagramPost[];
}

export default function HomeConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("hero");

  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    videoUrl: "",
    posterUrl: "",
    title: "Timeless Elegance",
    subtitle: "Handcrafted traditional wear",
    ctaPrimary: { text: "Shop Collection", href: "/products" },
    ctaSecondary: { text: "Our Story", href: "/about" },
  });

  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [featuredConfig, setFeaturedConfig] = useState<FeaturedConfig>({
    productId: "",
    kicker: "Featured",
    title: "Featured Product",
    description: "Our most loved piece this season.",
    ctaLabel: "View Details",
  });

  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    tagline: "Celebrating the artistry of Indian craftsmanship",
    email: "hello@ethnoj.in",
    phone: "+91 98765 43210",
    address: "Mumbai, India",
    instagramUrl: "",
    facebookUrl: "",
    pinterestUrl: "",
  });

  const [instagramConfig, setInstagramConfig] = useState<InstagramConfig>({
    handle: "@ethnoj",
    posts: [],
  });

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchConfigs(controller.signal);
    fetchProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchProducts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProduct = products.find(
    (p) => p.id === featuredConfig.productId || p.slug === featuredConfig.productId
  );

  async function fetchConfigs(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 10000);
      });

      const fetchPromise = supabase
        .from("home_config")
        .select("*")
        .eq("is_active", true);

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as Awaited<typeof fetchPromise>;

      if (signal?.aborted) return;

      if (error) {
        console.error("Error fetching configs:", error);
        toast.error("Failed to load config. Using defaults.");
        setLoading(false);
        return;
      }

      if (data) {
        data.forEach((config) => {
          switch (config.section) {
            case "hero":
              setHeroConfig(config.config as HeroConfig);
              break;
            case "carousel":
              setCarouselItems(config.config as CarouselItem[]);
              break;
            case "featured":
              setFeaturedConfig(config.config as FeaturedConfig);
              break;
            case "footer":
              setFooterConfig(config.config as FooterConfig);
              break;
            case "instagram":
              setInstagramConfig(config.config as InstagramConfig);
              break;
          }
        });
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Error fetching configs:", error);
      toast.error("Connection issue. You can still edit and save.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  async function saveConfig(section: string, config: any) {
    setSaving(section);
    const supabase = createClient();

    try {
      const { data: existing } = await supabase
        .from("home_config")
        .select("id")
        .eq("section", section)
        .single();

      if (existing) {
        await supabase
          .from("home_config")
          .update({
            config,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("home_config").insert({
          section,
          config,
          is_active: true,
        });
      }

      toast.success(`${section} configuration saved`);
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    }
    setSaving(null);
  }

  const tabs = [
    { id: "hero", label: "Hero Section", icon: Video },
    { id: "carousel", label: "Category Carousel", icon: ImageIcon },
    { id: "featured", label: "Featured Product", icon: Home },
    { id: "instagram", label: "Instagram Feed", icon: Instagram },
    { id: "footer", label: "Footer", icon: Type },
  ];

  const addInstagramPost = () => {
    const newPost: InstagramPost = {
      id: Date.now().toString(),
      imageUrl: "",
      postUrl: "",
      caption: "",
    };
    setInstagramConfig({
      ...instagramConfig,
      posts: [...instagramConfig.posts, newPost],
    });
  };

  const updateInstagramPost = (id: string, field: keyof InstagramPost, value: string) => {
    setInstagramConfig({
      ...instagramConfig,
      posts: instagramConfig.posts.map((post) =>
        post.id === id ? { ...post, [field]: value } : post
      ),
    });
  };

  const removeInstagramPost = (id: string) => {
    setInstagramConfig({
      ...instagramConfig,
      posts: instagramConfig.posts.filter((post) => post.id !== id),
    });
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
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          Home Page Configuration
        </h1>
        <p className="text-gray-500 mt-1">
          Customize your homepage sections
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CloudinaryUpload
              label="Hero Video"
              value={heroConfig.videoUrl}
              onChange={(url) => setHeroConfig({ ...heroConfig, videoUrl: url })}
              type="video"
            />

            <CloudinaryUpload
              label="Poster Image (Fallback)"
              value={heroConfig.posterUrl}
              onChange={(url) => setHeroConfig({ ...heroConfig, posterUrl: url })}
              type="image"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={heroConfig.title}
                onChange={(e) =>
                  setHeroConfig({ ...heroConfig, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={heroConfig.subtitle}
                onChange={(e) =>
                  setHeroConfig({ ...heroConfig, subtitle: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary CTA Text
              </label>
              <input
                type="text"
                value={heroConfig.ctaPrimary.text}
                onChange={(e) =>
                  setHeroConfig({
                    ...heroConfig,
                    ctaPrimary: { ...heroConfig.ctaPrimary, text: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary CTA Link
              </label>
              <input
                type="text"
                value={heroConfig.ctaPrimary.href}
                onChange={(e) =>
                  setHeroConfig({
                    ...heroConfig,
                    ctaPrimary: { ...heroConfig.ctaPrimary, href: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>
          </div>

          <button
            onClick={() => saveConfig("hero", heroConfig)}
            disabled={saving === "hero"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50"
          >
            {saving === "hero" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Hero Section
          </button>
        </div>
      )}

      {/* Carousel Section */}
      {activeTab === "carousel" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Category Carousel</h2>
          <p className="text-sm text-gray-500">
            Categories are managed in the Categories section. This displays the
            category carousel order and visibility.
          </p>

          <div className="border rounded-lg divide-y">
            {carouselItems.map((item, index) => (
              <div
                key={item.id}
                className="p-4 flex items-center gap-4"
              >
                <span className="text-gray-400 w-6">{index + 1}.</span>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.label}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.tagline}</p>
                </div>
              </div>
            ))}
            {carouselItems.length === 0 && (
              <p className="p-4 text-gray-500 text-center">
                No carousel items. Add categories to display them here.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Featured Product Section */}
      {activeTab === "featured" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Featured Product</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:border-maroon/50 focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-colors"
                >
                  {selectedProduct ? (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {selectedProduct.image ? (
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                        <p className="text-xs text-gray-500">₹{selectedProduct.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      {productsLoading ? "Loading products..." : "Choose a product"}
                    </span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${productDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {productDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {productsLoading ? "Loading..." : "No products found"}
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setFeaturedConfig({ ...featuredConfig, productId: product.slug || product.id });
                              setProductDropdownOpen(false);
                              setProductSearch("");
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-cream/50 transition-colors ${
                              featuredConfig.productId === product.id || featuredConfig.productId === product.slug
                                ? "bg-maroon/5"
                                : ""
                            }`}
                          >
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">
                                ₹{product.price.toLocaleString()}
                                {product.category && ` • ${product.category}`}
                              </p>
                            </div>
                            {(featuredConfig.productId === product.id || featuredConfig.productId === product.slug) && (
                              <Check className="h-5 w-5 text-maroon flex-shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kicker Text
              </label>
              <input
                type="text"
                value={featuredConfig.kicker}
                onChange={(e) =>
                  setFeaturedConfig({ ...featuredConfig, kicker: e.target.value })
                }
                placeholder="e.g., Featured, Bestseller"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={featuredConfig.title}
                onChange={(e) =>
                  setFeaturedConfig({ ...featuredConfig, title: e.target.value })
                }
                placeholder="Section title"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Label
              </label>
              <input
                type="text"
                value={featuredConfig.ctaLabel}
                onChange={(e) =>
                  setFeaturedConfig({ ...featuredConfig, ctaLabel: e.target.value })
                }
                placeholder="e.g., View Details, Shop Now"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={featuredConfig.description}
                onChange={(e) =>
                  setFeaturedConfig({ ...featuredConfig, description: e.target.value })
                }
                placeholder="A short description for the featured section"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon resize-none"
              />
            </div>
          </div>

          <button
            onClick={() => saveConfig("featured", featuredConfig)}
            disabled={saving === "featured"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50"
          >
            {saving === "featured" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Featured Section
          </button>
        </div>
      )}

      {/* Instagram Section */}
      {activeTab === "instagram" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Instagram Feed</h2>
          <p className="text-sm text-gray-500">
            Add Instagram posts to display on the homepage. Copy the image URL and post link from your Instagram posts.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram Handle
            </label>
            <input
              type="text"
              value={instagramConfig.handle}
              onChange={(e) =>
                setInstagramConfig({ ...instagramConfig, handle: e.target.value })
              }
              placeholder="@yourusername"
              className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Posts</h3>
              <button
                onClick={addInstagramPost}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
                Add Post
              </button>
            </div>

            {instagramConfig.posts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <Instagram className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No Instagram posts added yet</p>
                <button
                  onClick={addInstagramPost}
                  className="mt-3 text-sm text-maroon hover:underline"
                >
                  Add your first post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instagramConfig.posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <CloudinaryUpload
                      label="Post Image"
                      value={post.imageUrl}
                      onChange={(url) => updateInstagramPost(post.id, "imageUrl", url)}
                      type="image"
                    />

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Post Link
                      </label>
                      <input
                        type="url"
                        value={post.postUrl}
                        onChange={(e) =>
                          updateInstagramPost(post.id, "postUrl", e.target.value)
                        }
                        placeholder="https://instagram.com/p/..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Caption (optional)
                      </label>
                      <input
                        type="text"
                        value={post.caption || ""}
                        onChange={(e) =>
                          updateInstagramPost(post.id, "caption", e.target.value)
                        }
                        placeholder="Short caption..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      />
                    </div>

                    <button
                      onClick={() => removeInstagramPost(post.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-4">
              <strong>Tip:</strong> Upload images directly or paste URLs. Downloaded Instagram images can be uploaded via the upload button.
            </p>
            <button
              onClick={() => saveConfig("instagram", instagramConfig)}
              disabled={saving === "instagram"}
              className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50"
            >
              {saving === "instagram" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Instagram Feed
            </button>
          </div>
        </div>
      )}

      {/* Footer Section */}
      {activeTab === "footer" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Footer Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={footerConfig.tagline}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, tagline: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={footerConfig.email}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={footerConfig.phone}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={footerConfig.address}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, address: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={footerConfig.instagramUrl}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, instagramUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={footerConfig.facebookUrl}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, facebookUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pinterest URL
              </label>
              <input
                type="url"
                value={footerConfig.pinterestUrl}
                onChange={(e) =>
                  setFooterConfig({ ...footerConfig, pinterestUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              />
            </div>
          </div>

          <button
            onClick={() => saveConfig("footer", footerConfig)}
            disabled={saving === "footer"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50"
          >
            {saving === "footer" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Footer Configuration
          </button>
        </div>
      )}
    </div>
  );
}
