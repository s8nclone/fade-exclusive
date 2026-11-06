import * as React from "react";
import { Check, Clock } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatUtcDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export interface OrderTimelineHistoryItem {
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  note: string | null;
}

export interface OrderStatusTimelineProps {
  currentStatus: string;
  history: OrderTimelineHistoryItem[];
  className?: string;
}

const CORE_PROGRESSION = [
  "awaiting_payment",
  "payment_submitted",
  "paid",
  "in_production",
  "ready",
  "delivered",
] as const;

export function OrderStatusTimeline({
  currentStatus,
  history,
  className,
}: OrderStatusTimelineProps) {
  const normalizedCurrent =
    currentStatus === "deposit_paid"
      ? "paid"
      : currentStatus === "shipped" || currentStatus === "ready_for_pickup"
        ? "ready"
        : currentStatus;

  const currentIdx = CORE_PROGRESSION.indexOf(
    normalizedCurrent as (typeof CORE_PROGRESSION)[number],
  );

  const normalizeStep = (status: string) =>
    status === "deposit_paid"
      ? "paid"
      : status === "shipped" || status === "ready_for_pickup"
        ? "ready"
        : status;

  const reachedAt = (step: string): string | null => {
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const entry = history[i];
      if (entry && normalizeStep(entry.toStatus) === step) {
        return entry.createdAt;
      }
    }
    return null;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <ol className="relative" aria-label="Order progress">
        {CORE_PROGRESSION.map((step, index) => {
          const isLast = index === CORE_PROGRESSION.length - 1;
          const isCompleted =
            currentIdx >= 0 &&
            (index < currentIdx || (isLast && index === currentIdx));
          const isCurrent = step === normalizedCurrent && !isCompleted;
          const date = isCompleted || isCurrent ? reachedAt(step) : null;

          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex gap-4 pb-5 last:pb-0"
            >
              {/* Connector line between step markers */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px",
                    isCompleted ? "bg-success" : "bg-border",
                  )}
                />
              )}

              {/* Step marker */}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  isCompleted
                    ? "border-success bg-success text-background"
                    : isCurrent
                      ? "border-accent bg-surface-elevated text-accent ring-4 ring-accent/15"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  `0${index + 1}`
                )}
              </span>

              {/* Step copy */}
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 pt-1.5",
                  !isCompleted && !isCurrent && "opacity-60",
                )}
              >
                <p
                  className={cn(
                    "text-sm",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground",
                  )}
                >
                  {ORDER_STATUS_LABELS[step] ?? step}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                    isCompleted
                      ? "text-success"
                      : isCurrent
                        ? "text-accent"
                        : "text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    date ? formatUtcDate(date, true) : "Complete"
                  ) : isCurrent ? (
                    "In Progress"
                  ) : (
                    <>
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      Pending
                    </>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {history.length > 0 && (
        <div className="border border-border bg-surface-elevated p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Atelier Activity Log
          </p>
          <ul className="mt-3 space-y-2.5">
            {history.map((item, idx) => (
              <li
                key={`${item.toStatus}-${idx}`}
                className="flex flex-col justify-between gap-1 border-b border-border/60 pb-2 text-xs last:border-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <span className="font-semibold text-foreground">
                    {ORDER_STATUS_LABELS[item.toStatus] ?? item.toStatus}
                  </span>
                  {item.note && (
                    <span className="ml-2 text-muted-foreground">— {item.note}</span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {formatUtcDate(item.createdAt, true)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
