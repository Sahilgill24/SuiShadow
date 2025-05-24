"use client"

import type React from "react"

import { motion, type MotionProps } from "framer-motion"
import type { ReactNode } from "react"

type MotionTag = "div" | "span" | "section" | "article" | "header" | "footer" | "main" | "nav" | "aside" | "ul" | "li" | "ol" | "form" | "button" | "a"

interface MotionWrapperProps extends MotionProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  as?: MotionTag
}

const motionMap = {
  div: motion.div,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  main: motion.main,
  nav: motion.nav,
  aside: motion.aside,
  ul: motion.ul,
  li: motion.li,
  ol: motion.ol,
  form: motion.form,
  button: motion.button,
  a: motion.a,
}

export function MotionWrapper({
  children,
  className,
  delay = 0,
  duration = 0.5,
  as = "div",
  ...props
}: MotionWrapperProps) {
  const Component = motionMap[as] || motion.div

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

export function FadeUp({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  return (
    <MotionWrapper className={className} delay={delay} {...props}>
      {children}
    </MotionWrapper>
  )
}

export function FadeIn({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  return (
    <MotionWrapper
      className={className}
      delay={delay}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </MotionWrapper>
  )
}

export function FadeLeft({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  return (
    <MotionWrapper
      className={className}
      delay={delay}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      {...props}
    >
      {children}
    </MotionWrapper>
  )
}

export function FadeRight({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  return (
    <MotionWrapper
      className={className}
      delay={delay}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      {...props}
    >
      {children}
    </MotionWrapper>
  )
}

export function ScaleIn({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  return (
    <MotionWrapper
      className={className}
      delay={delay}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      {...props}
    >
      {children}
    </MotionWrapper>
  )
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function StaggerContainer({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, ...props }: MotionWrapperProps) {
  return (
    <motion.div className={className} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  )
}
