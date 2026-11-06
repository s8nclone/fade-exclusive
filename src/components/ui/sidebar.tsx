"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem"; // 256px / w-64

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Shadcn-compatible SidebarProvider.
 * Coordinates desktop fixed state and mobile sheet drawer state.
 */
export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
}: SidebarProviderProps) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const nextOpen = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(nextOpen);
      } else {
        _setOpen(nextOpen);
      }
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "flex h-screen w-full overflow-hidden bg-background text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => {
  return (
    <aside
      ref={ref}
      data-sidebar="sidebar"
      className={cn(
        "hidden lg:flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface select-none",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex h-20 shrink-0 items-center justify-between border-b border-border px-5",
        className,
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export interface SidebarContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hideScrollbar?: boolean;
  showIndicators?: boolean;
}

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  SidebarContentProps
>(
  (
    {
      className,
      hideScrollbar = true,
      showIndicators = true,
      children,
      onScroll,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLDivElement | null>(null);
    const [canScrollUp, setCanScrollUp] = React.useState(false);
    const [canScrollDown, setCanScrollDown] = React.useState(false);

    React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

    const updateScrollIndicators = React.useCallback(() => {
      const el = internalRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      setCanScrollUp(scrollTop > 8);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 8);
    }, []);

    React.useEffect(() => {
      const el = internalRef.current;
      if (!el) return;

      updateScrollIndicators();

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          updateScrollIndicators();
        });
        resizeObserver.observe(el);
      }

      window.addEventListener("resize", updateScrollIndicators);
      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener("resize", updateScrollIndicators);
      };
    }, [updateScrollIndicators]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      updateScrollIndicators();
      onScroll?.(e);
    };

    const scrollByDelta = (delta: number) => {
      internalRef.current?.scrollBy({
        top: delta,
        behavior: "smooth",
      });
    };

    return (
      <div className="relative flex flex-1 min-h-0 flex-col">
        {showIndicators && canScrollUp && (
          <div className="pointer-events-auto absolute top-1 left-0 right-0 z-20 flex justify-center px-3">
            <button
              type="button"
              onClick={() => scrollByDelta(-140)}
              aria-label="Scroll up to view previous menu items"
              className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent shadow-sm hover:bg-surface cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <ChevronUp className="h-3 w-3 animate-pulse" />
              <span>Scroll Up</span>
            </button>
          </div>
        )}

        <div
          ref={internalRef}
          data-sidebar="content"
          onScroll={handleScroll}
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 relative",
            hideScrollbar ? "scrollbar-none" : "scrollbar-luxury",
            className,
          )}
          {...props}
        >
          {children}
        </div>

        {showIndicators && canScrollDown && (
          <div className="pointer-events-auto absolute bottom-1 left-0 right-0 z-20 flex justify-center px-3">
            <button
              type="button"
              onClick={() => scrollByDelta(140)}
              aria-label="Scroll down to view more menu items"
              className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent shadow-sm hover:bg-surface cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <span>More Items</span>
              <ChevronDown className="h-3 w-3 animate-pulse" />
            </button>
          </div>
        )}
      </div>
    );
  },
);
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("flex flex-col gap-1 py-1", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full", className)}
      {...props}
    />
  );
});
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative list-none", className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

export const sidebarMenuButtonVariants = cva(
  "flex min-h-[42px] w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "text-foreground hover:bg-surface-elevated hover:text-foreground",
        active: "bg-primary text-primary-foreground hover:bg-primary/95",
      },
      size: {
        default: "min-h-[42px] text-xs",
        sm: "min-h-[36px] text-[11px]",
        lg: "min-h-[48px] text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  isActive?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, variant = "default", size = "default", isActive = false, ...props }, ref) => {
  const computedVariant = isActive ? "active" : variant;
  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ variant: computedVariant, size, className }),
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("shrink-0 border-t border-border p-4 space-y-3", className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-9 w-9 p-0", className)}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="inset"
      className={cn(
        "flex flex-1 h-full min-w-0 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";
