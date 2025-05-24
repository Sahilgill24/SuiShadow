"use client"

import { motion } from "framer-motion"
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { AnimatedText } from "./animated/animated-text"
import { AnimatedCard } from "./animated/animated-card"

const useCases = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-primary"
      >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: "Mystery Boxes",
    description: "Create digital mystery boxes with encrypted contents that reveal themselves only after purchase."
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-primary"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Time Capsules",
    description: "Create digital time capsules that reveal content only after a specific date or event, perfect for commemorative releases."
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-primary"
      >
        <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0Z" />
        <polyline points="2.32 6.16 12 11 21.68 6.16" />
        <line x1="12" x2="12" y1="22.76" y2="11" />
      </svg>
    ),
    title: "Exclusive NFTs",
    description: "Create truly unique digital collectibles with partially revealed content, increasing scarcity and collector value."
  }
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="w-full bg-muted/40 flex justify-center border-b">
      <div className="container pt-8 md:pt-12 lg:pt-16 border-l border-r">
        <FadeUp className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              Applications
            </motion.div>
            <AnimatedText
              text="Use Cases"
              className="text-3xl font-bold tracking-tight sm:text-5xl"
              delay={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Discover how Sui Shadow transforms digital content across various industries.
            </motion.p>
          </div>
        </FadeUp>
        <StaggerContainer className="w-full grid grid-cols-1 lg:grid-cols-3 mt-16">
          {useCases.map((useCase) => (
            <StaggerItem key={useCase.title}>
              <AnimatedCard className="flex flex-col items-center space-y-2 border bg-transparent p-6 w-full text-center h-full">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                >
                  {useCase.icon}
                </motion.div>
                <h3 className="text-xl font-bold">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}