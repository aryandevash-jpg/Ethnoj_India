import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConditionalChrome } from "@/components/ConditionalChrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Ethnoj — Heirloom Indian Ethnic Wear",
  description:
    "Hand-crafted lehengas, sarees, kurtis, suits and co-ord sets. Heirloom-worthy Indian ethnic wear, woven by artisans.",
  openGraph: {
    title: "Ethnoj — Heirloom Indian Ethnic Wear",
    description:
      "Hand-crafted lehengas, sarees, kurtis, suits and co-ord sets. Heirloom-worthy Indian ethnic wear, woven by artisans.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethnoj — Heirloom Indian Ethnic Wear",
    description:
      "Hand-crafted lehengas, sarees, kurtis, suits and co-ord sets. Heirloom-worthy Indian ethnic wear, woven by artisans.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
        <ConditionalChrome>{children}</ConditionalChrome>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "oklch(0.965 0.018 80)",
              border: "1px solid oklch(0.74 0.13 80 / 0.4)",
              color: "oklch(0.22 0.02 50)",
            },
          }}
        />
      </body>
    </html>
  );
}
