"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FadeUp, FadeLeft } from "@/components/motion-wrapper";
import { AnimatedButton } from "./animated/animated-button";
import { AnimatedText } from "./animated/animated-text";
import { ConnectModal } from "@mysten/dapp-kit";

export function HeroSection() {
  return (
    <section className="w-full bg-background text-foreground flex justify-center border-b">
      <div className="container py-12 md:py-24 lg:py-32 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_650px]">
          <FadeUp
            className="flex flex-col justify-center space-y-4"
            delay={0.2}
          >
            <div className="space-y-2">
              <AnimatedText
                text="Confidential NFTs"
                className="text-3xl font-bold sm:text-5xl xl:text-6xl text-primary tracking-tight"
                delay={0.3}
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="max-w-[600px] text-muted-foreground md:text-xl"
              >
                Revolutionizing digital ownership with encrypted content,
                selective disclosure, and time-based reveals.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col gap-2 min-[400px]:flex-row"
            >
              <ConnectModal
                trigger={
                  <AnimatedButton size={"lg"}>
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                }
              />
            </motion.div>
          </FadeUp>
          <FadeLeft delay={0.4}>
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="relative w-full max-w-[600px] overflow-hidden rounded-lg border bg-card p-2"
              >
                <img
                  src="/demo.png"
                  alt="Sui Shadow NFT Concept"
                  className="aspect-square object-cover"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/50 to-transparent flex flex-col justify-end p-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 1,
                        }}
                        className="h-2 w-2 rounded-full bg-primary"
                      ></motion.div>
                      <span className="text-xs text-primary">
                        Encrypted Content
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Obfuscated NFT #1337
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Reveal conditions: Time-based unlock in 3 days
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
