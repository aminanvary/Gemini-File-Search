import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[var(--neu-subtle)]",
        secondary:
          "bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-[var(--neu-subtle)]",
        destructive:
          "bg-[var(--danger)]/20 text-[var(--danger)] shadow-[var(--neu-subtle)]",
        outline:
          "border border-[var(--border)] text-[var(--text-secondary)]",
        success:
          "bg-[var(--success)]/20 text-[var(--success)] shadow-[var(--neu-subtle)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
