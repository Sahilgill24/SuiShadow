"use client"

import { motion } from "framer-motion"
import { AnimatedText } from "@/components/landing-page/animated/animated-text"

interface HeroSectionProps {
  title: string
  description: string
  badge: string
}

export function HeroSection({ title, description, badge }: HeroSectionProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              {badge}
            </motion.div>
            <AnimatedText
              text={title}
              className="text-3xl font-bold tracking-tight flex justify-center sm:text-4xl md:text-5xl lg:text-6xl/none"
              delay={0.2}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-max-w-[700px] text-muted-foreground md:text-xl"
            >
              {description}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
