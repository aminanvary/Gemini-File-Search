import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[var(--neu-raised),0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[var(--neu-float),0_6px_30px_rgba(245,158,11,0.4)] hover:brightness-110 active:shadow-[var(--neu-inset)] active:brightness-95",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--neu-raised)] hover:shadow-[var(--neu-float)] hover:bg-[var(--bg-surface)] active:shadow-[var(--neu-inset)]",
        destructive:
          "bg-[var(--bg-elevated)] text-[var(--danger)] shadow-[var(--neu-raised)] hover:shadow-[var(--neu-float)] hover:bg-red-500/10 active:shadow-[var(--neu-inset)]",
        outline:
          "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-[var(--neu-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50 hover:shadow-[var(--neu-raised)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline",
        // Neumorphic variants - softer, more tactile appearance
        neumorphic:
          "bg-[linear-gradient(145deg,var(--bg-surface),var(--bg-elevated))] text-[var(--text-primary)] rounded-2xl shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] border border-[var(--border)]/30 hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] hover:-translate-y-0.5 active:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] active:translate-y-0",
        "neumorphic-accent":
          "bg-[linear-gradient(145deg,#1f1f2a,#1a1a22)] text-[var(--accent-primary)] rounded-2xl shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] border border-[var(--accent-primary)]/20 hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light),0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:brightness-110 hover:scale-[1.02] active:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] active:translate-y-0 active:scale-100",
        "neumorphic-glow":
          "bg-[linear-gradient(145deg,#252532,#1e1e28)] text-[var(--accent-primary)] rounded-2xl shadow-[5px_5px_10px_var(--shadow-dark),-5px_-5px_10px_var(--shadow-light),inset_0_1px_0_rgba(255,255,255,0.05)] border border-[var(--accent-primary)]/25 hover:shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light),0_0_25px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:text-[var(--accent-hover)] hover:brightness-110 hover:scale-[1.02] active:shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] active:translate-y-0 active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
