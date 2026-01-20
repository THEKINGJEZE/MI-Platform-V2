import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 *
 * From spec: "Loading State"
 * - Subtle shimmer animation (not spinner)
 * - Maintain layout to prevent jank
 * - Respects prefers-reduced-motion
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-md bg-surface-1",
        // Shimmer animation with gradient
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-surface-2/50 before:to-transparent",
        "before:animate-[shimmer_2s_infinite]",
        // Fallback for reduced motion
        "motion-reduce:before:animate-none motion-reduce:animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
