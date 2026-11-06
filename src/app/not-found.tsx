import Link from "next/link";
import { Logo } from "@/components/atoms/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center text-foreground">
      <Logo variant="editorial" />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
        ERROR 404
      </p>
      <h1 className="mt-2 font-serif text-4xl font-normal uppercase sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The requested destination does not exist or has been archived from the
        Fadé Exclusives storefront.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex min-h-[46px] items-center justify-center bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground"
        >
          Return Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex min-h-[46px] items-center justify-center border border-border bg-surface-elevated px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground"
        >
          Explore 2026 Collection
        </Link>
      </div>
    </div>
  );
}
