export type Category =
  | "co-ord-sets"
  | "kurtis"
  | "ladies-suits"
  | "sarees"
  | "lehengas";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  mrp?: number;
  image: string;
  hoverImage: string;
  videoUrl?: string;
  colors: string[];
  sizes: string[];
  description: string;
  featured?: boolean;
  rating: number;
  reviews: number;
}

export const categories: {
  id: Category;
  label: string;
  image: string;
  tagline: string;
}[] = [
  {
    id: "lehengas",
    label: "Lehengas",
    tagline: "Bridal heirlooms",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
  },
  {
    id: "sarees",
    label: "Sarees",
    tagline: "Draped poetry",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&q=80",
  },
  {
    id: "kurtis",
    label: "Kurtis",
    tagline: "Everyday elegance",
    image:
      "https://images.unsplash.com/photo-1623911738571-30bcc6537af5?w=900&q=80",
  },
  {
    id: "co-ord-sets",
    label: "Co-ord Sets",
    tagline: "Modern muse",
    image:
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=900&q=80",
  },
  {
    id: "ladies-suits",
    label: "Ladies Suits",
    tagline: "Festive grace",
    image:
      "https://images.unsplash.com/photo-1606293459308-87fc7b9d54f7?w=900&q=80",
  },
];

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const products: Product[] = [
  {
    id: "anaara-lehenga",
    name: "Anaara Zardozi Lehenga",
    category: "lehengas",
    price: 24999,
    mrp: 32999,
    image: img("photo-1610030469983-98e550d6193c"),
    hoverImage: img("photo-1583391733956-6c78276477e2"),
    colors: ["#A8294B", "#1F5C4D", "#D4A437"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Hand-embroidered zardozi lehenga in deep rani pink, paired with a dupatta in soft tulle and a scalloped gold border.",
    featured: true,
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "meher-saree",
    name: "Meher Banarasi Silk Saree",
    category: "sarees",
    price: 8999,
    mrp: 12499,
    image: img("photo-1583391733956-6c78276477e2"),
    hoverImage: img("photo-1610030469983-98e550d6193c"),
    colors: ["#1F5C4D", "#A8294B", "#2B2420"],
    sizes: ["Free"],
    description:
      "Pure Banarasi silk with traditional kadhwa weave motifs and a contrast gold zari pallu.",
    featured: true,
    rating: 4.8,
    reviews: 92,
  },
  {
    id: "ira-kurti",
    name: "Ira Chikankari Kurti",
    category: "kurtis",
    price: 2499,
    mrp: 3299,
    image: img("photo-1623911738571-30bcc6537af5"),
    hoverImage: img("photo-1606293459308-87fc7b9d54f7"),
    colors: ["#FBF6EE", "#D4A437", "#1F5C4D"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Lucknowi chikankari on breathable cotton — handcrafted by master artisans.",
    featured: true,
    rating: 4.7,
    reviews: 214,
  },
  {
    id: "noor-coord",
    name: "Noor Mirror-work Co-ord",
    category: "co-ord-sets",
    price: 4499,
    mrp: 5999,
    image: img("photo-1617922001439-4a2e6562f328"),
    hoverImage: img("photo-1623911738571-30bcc6537af5"),
    colors: ["#A8294B", "#D4A437"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Mirror-work co-ord set with cropped kurti and flared palazzo. A modern muse in maroon.",
    featured: true,
    rating: 4.8,
    reviews: 76,
  },
  {
    id: "saira-suit",
    name: "Saira Gota-patti Suit",
    category: "ladies-suits",
    price: 5499,
    mrp: 7499,
    image: img("photo-1606293459308-87fc7b9d54f7"),
    hoverImage: img("photo-1617922001439-4a2e6562f328"),
    colors: ["#1F5C4D", "#BFA15A"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Festive gota-patti suit with a flowing dupatta and intricate hand-embroidered yoke.",
    featured: true,
    rating: 4.9,
    reviews: 64,
  },
  {
    id: "diya-saree",
    name: "Diya Organza Saree",
    category: "sarees",
    price: 6499,
    image: img("photo-1594387310657-1530a4af7842"),
    hoverImage: img("photo-1583391733956-6c78276477e2"),
    colors: ["#D4A437", "#A8294B"],
    sizes: ["Free"],
    description:
      "Featherlight organza saree with hand-painted floral motifs and a scalloped gold edge.",
    rating: 4.6,
    reviews: 41,
  },
  {
    id: "kiara-lehenga",
    name: "Kiara Emerald Lehenga",
    category: "lehengas",
    price: 18999,
    mrp: 24999,
    image: img("photo-1594387310657-1530a4af7842"),
    hoverImage: img("photo-1610030469983-98e550d6193c"),
    colors: ["#1F5C4D", "#D4A437"],
    sizes: ["S", "M", "L"],
    description:
      "Emerald velvet lehenga with antique gold dabka — for the heirloom-worthy entrance.",
    rating: 4.9,
    reviews: 53,
  },
  {
    id: "rhea-kurti",
    name: "Rhea Block-print Kurti",
    category: "kurtis",
    price: 1899,
    image: img("photo-1623911738571-30bcc6537af5"),
    hoverImage: img("photo-1606293459308-87fc7b9d54f7"),
    colors: ["#FBF6EE", "#1F5C4D"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Hand-block printed kurti in soft cotton — every motif is stamped by hand.",
    rating: 4.5,
    reviews: 137,
  },
];

export const reviews = [
  {
    id: 1,
    name: "Aanya Sharma",
    rating: 5,
    text: "The lehenga is even more beautiful in person. The zari work is exquisite — got compliments all night.",
    image: img("photo-1610030469983-98e550d6193c", 600),
  },
  {
    id: 2,
    name: "Priya Menon",
    rating: 5,
    text: "Beautiful saree, the silk feels rich and the pallu is stunning. Will buy again.",
  },
  {
    id: 3,
    name: "Ritika Bansal",
    rating: 4,
    text: "Loved the kurti — perfect fit and the chikankari is genuine. Slight delay in delivery though.",
    image: img("photo-1623911738571-30bcc6537af5", 600),
  },
  {
    id: 4,
    name: "Sneha Iyer",
    rating: 5,
    text: "Wore the co-ord set to my engagement and felt like a dream. The mirror work catches the light beautifully.",
  },
  {
    id: 5,
    name: "Tanvi Rao",
    rating: 5,
    text: "Ethnoj has become my go-to for festive wear. The packaging itself feels like a gift.",
    image: img("photo-1617922001439-4a2e6562f328", 600),
  },
  {
    id: 6,
    name: "Megha Kapoor",
    rating: 4,
    text: "Saree quality is wonderful. Could use more size options for the blouse.",
  },
  {
    id: 7,
    name: "Nisha Verma",
    rating: 5,
    text: "Bridal lehenga shopping made effortless. The team helped with sizing over chat — 10/10.",
  },
  {
    id: 8,
    name: "Divya Pillai",
    rating: 5,
    text: "The gota-patti suit is breathtaking. Quality of fabric and craftsmanship is unmatched.",
    image: img("photo-1606293459308-87fc7b9d54f7", 600),
  },
];

export const HERO_VIDEO =
  "https://cdn.coverr.co/videos/coverr-traditional-indian-dance-2483/1080p.mp4";
export const HERO_POSTER = img("photo-1610030469983-98e550d6193c", 1600);
