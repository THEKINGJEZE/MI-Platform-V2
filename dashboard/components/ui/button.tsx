import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button Variants
 *
 * Extended with spec variants:
 * - default (primary action colour)
 * - secondary (surface-1 background)
 * - ghost (transparent, hover shows surface-1)
 * - danger (destructive actions)
 * - success (positive confirmation)
 * - outline (bordered variant)
 * - link (text-only with underline)
 *
 * Accessibility:
 * - Focus ring using action colour with 2px offset
 * - Disabled state with reduced opacity
 * - Minimum touch target 44x44px on mobile
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  {
    variants: {
      variant: {
        // Primary action button (default)
        default:
          "bg-action text-white hover:bg-action/90",

        // Secondary button (surface background)
        secondary:
          "bg-surface-1 text-primary hover:bg-surface-2",

        // Ghost button (transparent)
        ghost:
          "text-secondary hover:text-primary hover:bg-surface-1",

        // Danger/destructive button
        danger:
          "bg-danger text-white hover:bg-danger/90",
        destructive:
          "bg-danger text-white hover:bg-danger/90",

        // Success button
        success:
          "bg-success text-white hover:bg-success/90",

        // Outline button
        outline:
          "border border-surface-1 bg-transparent text-primary hover:bg-surface-1",

        // Link button (text only)
        link:
          "text-action underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        // Default size (h-10)
        default: "h-10 px-4 py-2",

        // Small size (h-8)
        sm: "h-8 px-3 text-xs rounded-md",

        // Large size (h-12)
        lg: "h-12 px-6 text-base rounded-md",

        // Icon button (square)
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Show loading spinner */
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        buttonVariants({ variant, size, className }),
        // Ensure minimum touch target on mobile
        "min-h-[44px] min-w-[44px]"
      )}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span className="sr-only">Loading</span>
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

/**
 * Loading Spinner for buttons
 * Respects prefers-reduced-motion
 */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "h-4 w-4 animate-spin motion-reduce:animate-none",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export { Button, buttonVariants };
