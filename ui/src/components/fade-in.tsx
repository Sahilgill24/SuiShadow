"use client"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  fullWidth?: boolean
}

export function FadeIn({ children, className, delay = 0, direction = "up", fullWidth = false }: FadeInProps) {
  const [isVisible, ref] = useIntersectionObserver()

  const getDirectionClasses = () => {
    switch (direction) {
      case "up":
        return "translate-y-10"
      case "down":
        return "translate-y-[-10px]"
      case "left":
        return "translate-x-10"
      case "right":
        return "translate-x-[-10px]"
      case "none":
        return ""
      default:
        return "translate-y-10"
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 transform-none" : `opacity-0 ${getDirectionClasses()}`,
        fullWidth ? "w-full" : "",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
