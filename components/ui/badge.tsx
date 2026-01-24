import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "verified" | "premium"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-muted text-muted-foreground": variant === "default",
          "bg-success text-success-foreground": variant === "verified",
          "bg-warning text-warning-foreground": variant === "premium",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }