import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="font-display text-4xl">Piece not found</h1>
      <p className="mt-4 text-ink/60">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block text-maroon underline underline-offset-4 hover:text-maroon-deep"
      >
        Back to shop
      </Link>
    </div>
  );
}
