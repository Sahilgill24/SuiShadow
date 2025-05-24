"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { buttonVariants } from "@/components/ui/button"
import React from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    children: ReactNode
  }

export const AnimatedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
        <Button ref={ref} {...props}>{children}</Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
