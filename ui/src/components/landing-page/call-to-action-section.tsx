"use client"

import { motion } from "framer-motion"
import { NavLink as Link } from "react-router"
import { FadeUp } from "@/components/motion-wrapper"
import { AnimatedText } from "./animated/animated-text"
import { AnimatedButton } from "./animated/animated-button"

export function CallToActionSection() {
  return (
    <section className="w-full bg-background flex justify-center">
      <div className="container py-12 md:py-24 lg:py-32 border-l border-r px-4 md:px-6">
        <FadeUp className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4 flex flex-col items-center justify-center">
            <AnimatedText
              text="Ready to Get Started?"
              className="text-3xl font-bold tracking-tight sm:text-5xl"
              delay={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Join the revolution in confidential NFTs and transform how digital content is shared and monetized.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full max-w-sm space-y-2"
          >
            <form className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                type="email"
                placeholder="Enter your email"
                className="rounded-md border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:flex-1"
              />
              <AnimatedButton size={'lg'}>Join Waitlist</AnimatedButton>
            </form>
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link to="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  )
} 