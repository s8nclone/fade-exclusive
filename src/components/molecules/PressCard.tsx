import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUtcDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export interface PressCardProps {
  outlet: string;
  title: string;
  excerpt: string;
  url: string;
  publishedDate: string;
  coverUrl: string;
  coverAlt: string;
  className?: string;
}

export function PressCard({
  outlet,
  title,
  excerpt,
  url,
  publishedDate,
  coverUrl,
  coverAlt,
  className,
}: PressCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col border border-border bg-surface-elevated",
        className,
      )}
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-surface">
        <img
          src={coverUrl}
          alt={coverAlt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            <span>{outlet}</span>
            <span className="text-muted-foreground">{formatUtcDate(publishedDate)}</span>
          </div>
          <h3 className="mt-2 font-serif text-xl font-normal leading-snug text-foreground">
            {title}
          </h3>
          {excerpt && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground hover:text-accent"
          >
            <span>Read Editorial</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function PressCardSkeleton() {
  return (
    <div className="flex flex-col border border-border bg-surface-elevated">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
