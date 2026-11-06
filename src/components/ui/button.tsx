import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-5 py-2.5 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground",
        accent:
          "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground",
        outline:
          "border border-foreground/30 bg-transparent text-foreground hover:border-foreground hover:bg-surface",
        secondary:
          "bg-surface text-foreground hover:bg-muted",
        ghost:
          "bg-transparent text-foreground hover:bg-surface",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "text-foreground underline-offset-4 hover:underline min-h-0 px-0 py-0",
      },
      size: {
        default: "min-h-[44px] px-5 py-2.5",
        sm: "min-h-[38px] px-3.5 py-1.5 text-[11px]",
        lg: "min-h-[52px] px-8 py-3.5 text-xs",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
