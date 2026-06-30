import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Preloader } from "@/components/Preloader";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-maroon">404</h1>
        <h2 className="mt-4 font-display text-2xl text-ink">This page has been packed away</h2>
        <p className="mt-2 text-sm text-ink/60">The piece you're looking for isn't here.</p>
        <div className="mt-6">
          <a href="/" className="rounded-full bg-maroon px-6 py-2.5 text-sm text-cream">Return home</a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-ink">Something unravelled</h1>
        <p className="mt-2 text-sm text-ink/60">Let's try that again.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-maroon px-6 py-2.5 text-sm text-cream"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ethnoj — Heirloom Indian Ethnic Wear" },
      { name: "description", content: "Hand-crafted lehengas, sarees, kurtis, suits and co-ord sets. Heirloom-worthy Indian ethnic wear, woven by artisans." },
      { property: "og:title", content: "Ethnoj — Heirloom Indian Ethnic Wear" },
      { property: "og:description", content: "Hand-crafted lehengas, sarees, kurtis, suits and co-ord sets. Heirloom-worthy Indian ethnic wear, woven by artisans." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Ethnoj — Heirloom Indian Ethnic Wear" },
      { name: "twitter:description", content: "Hand-crafted lehengas, sarees, kurtis, suits and co-ord sets. Heirloom-worthy Indian ethnic wear, woven by artisans." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6b87a58-c354-4b36-aab6-549ddca79010/id-preview-d038696e--8f6d0ad1-0cf8-4e7b-b26e-9a8f2aba4e2c.lovable.app-1782822695675.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6b87a58-c354-4b36-aab6-549ddca79010/id-preview-d038696e--8f6d0ad1-0cf8-4e7b-b26e-9a8f2aba4e2c.lovable.app-1782822695675.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Preloader />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1"><Outlet /></main>
        <Footer />
      </div>
      <CartDrawer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--cream)",
            border: "1px solid color-mix(in oklab, var(--gold) 40%, transparent)",
            color: "var(--ink)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
