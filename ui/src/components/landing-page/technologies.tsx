"use client";

import { motion } from "framer-motion";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion-wrapper";
import { AnimatedText } from "./animated/animated-text";
import { AnimatedCard } from "./animated/animated-card";
import { Eye,ScanFace,GlobeLock, Layers, Clock, Package2, Lock,Database } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ScanFace,
    title: "ZKlogin",
    description:
      "Prevent unauthorized copying while maintaining exclusive access for legitimate owners.",
  },
  {
    icon: GlobeLock,
    title: "Seal",
    description:
      "Offer partial content previews while keeping premium features encrypted until purchase.",
  },

  {
    icon: Database,
    title: "Walrus",
    description:
      "Securely store and manage data with decentralized storage",
  },
];

export function TechnologiesSection() {
  return (
    <section
      id="features"
      className="w-full bg-muted/40 flex justify-center border-b"
    >
      <div className="container pt-8 md:pt-12 lg:pt-16 border-l border-r">
        <FadeUp className="flex flex-col items-center justify-center space-y-4 text-center px-4 md:px-6">
          <div className="space-y-2 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm text-primary"
            >
              Core Tech
            </motion.div>
            <AnimatedText
              text="Technologies"
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
                Explore the cutting-edge technologies that power our platform,
            </motion.p>
          </div>
        </FadeUp>
        <StaggerContainer className="w-full flex flex-wrap items-center justify-center mt-16">
          {features.map((feature) => (
            <StaggerItem key={feature.title} className={cn("w-full lg:w-1/3")}>
              <AnimatedCard className="flex flex-col items-center space-y-2 border bg-transparent p-6 w-full text-center h-full">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                >
                  <feature.icon className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
