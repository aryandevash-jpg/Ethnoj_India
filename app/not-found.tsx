import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-maroon">404</h1>
        <h2 className="mt-4 font-display text-2xl text-ink">
          This page has been packed away
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          The piece you&apos;re looking for isn&apos;t here.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="rounded-full bg-maroon px-6 py-2.5 text-sm text-cream transition hover:bg-maroon-deep"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
