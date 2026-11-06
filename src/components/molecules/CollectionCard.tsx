import * as React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface CollectionCardProps {
  slug: string;
  title: string;
  season: string;
  story: string;
  coverUrl: string;
  coverAlt: string;
  itemCount: number;
  className?: string;
}

export function CollectionCard({
  slug,
  title,
  season,
  story,
  coverUrl,
  coverAlt,
  itemCount,
  className,
}: CollectionCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col border border-border bg-surface-elevated",
        className,
      )}
    >
      <Link
        href={`/collections/${slug}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-surface"
      >
        <img
          src={coverUrl}
          alt={coverAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
            {season} • {itemCount} {itemCount === 1 ? "Look" : "Looks"}
          </p>
          <Link
            href={`/collections/${slug}`}
            className="mt-2 block font-serif text-2xl font-normal text-foreground group-hover:text-accent"
          >
            {title}
          </Link>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {story}
          </p>
        </div>
        <div className="mt-5 pt-4 border-t border-border">
          <Link
            href={`/collections/${slug}`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:text-accent"
          >
            Explore Lookbook →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="flex flex-col border border-border bg-surface-elevated">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
