"use client";

import { motion } from "framer-motion";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion-wrapper";
import { AnimatedText } from "./animated/animated-text";
import { AnimatedCard } from "./animated/animated-card";
import { Eye, EyeOff, Hash, Zap } from "lucide-react";

function StepOne() {
  return (
    <FadeUp delay={0.2}>
      <AnimatedCard className="relative flex flex-col items-center justify-between space-y-6 h-full border p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute -top-4 left-4 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground"
        >
          Step 1
        </motion.div>
        <h3 className="text-2xl font-bold">Original to Obfuscated</h3>
        <div className="grid grid-cols-3 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-muted to-card rounded-lg flex items-center justify-center border">
              <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-foreground" />
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Original Content
            </span>
          </motion.div>
          <div className="flex flex-col gap-1 self-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                hide selected pixels
              </span>
            </div>
            <div className="w-full flex items-center">
              <div className="w-[calc(100%-2rem)] bg-primary/30 h-1 rounded-l-full" />
              <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-10 border-l-primary/30" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col items-center space-y-2"
          >
            <div>
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center border">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Obfuscated Content
            </span>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-muted-foreground text-center"
        >
          Selected pixels are hidden and encrypted, creating a partially visible
          preview while protecting the full content.
        </motion.p>
      </AnimatedCard>
    </FadeUp>
  );
}

function StepTwo() {
  return (
    <FadeUp delay={0.4}>
      <AnimatedCard className="relative flex flex-col items-center justify-between h-full space-y-6 border p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute -top-4 left-4 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground"
        >
          Step 2
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-bold"
        >
          Encrypt & Hash
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4 w-full"
        >
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-muted-foreground mb-3"
            >
              Encrypt & hash obfuscated parts
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="flex-1 bg-muted p-2 rounded text-xs font-mono"
                >
                  enc0
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="flex-1 bg-muted p-2 rounded text-xs font-mono"
                >
                  enc1
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  className="flex-1 bg-muted p-2 rounded text-xs font-mono"
                >
                  encN
                </motion.div>
              </div>
              <div className="flex gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                  className="flex-1 bg-muted p-2 rounded text-xs font-mono"
                >
                  hash0
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                  className="flex-1 bg-muted p-2 rounded text-xs font-mono"
                >
                  hash1
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                  className="flex-1 bg-muted p-2 rounded text-xs font-mono"
                >
                  hashN
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="text-sm text-muted-foreground mb-2"
            >
              create Merkle tree
            </motion.div>
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="space-y-2"
              >
                <div className="flex gap-1">
                  <div className="w-8 h-6 bg-muted rounded-sm"></div>
                  <div className="w-8 h-6 bg-muted rounded-sm"></div>
                  <div className="w-8 h-6 bg-primary rounded-sm"></div>
                  <div className="w-8 h-6 bg-muted rounded-sm"></div>
                </div>
                <div className="flex gap-1 justify-center">
                  <div className="w-8 h-6 bg-muted rounded-sm"></div>
                  <div className="w-8 h-6 bg-muted rounded-sm"></div>
                </div>
                <div className="flex justify-center">
                  <div className="w-12 h-6 bg-primary rounded-sm flex items-center justify-center">
                    <Hash className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-muted-foreground text-center"
        >
          Encrypted parts are hashed and organized in a Merkle tree structure,
          ensuring verifiable integrity.
        </motion.p>
      </AnimatedCard>
    </FadeUp>
  );
}

function StepThree() {
  return (
    <FadeUp delay={0.6} className="lg:col-span-2">
      <AnimatedCard className="relative flex flex-col items-center justify-between space-y-6 border p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute -top-4 left-4 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground"
        >
          Step 3
        </motion.div>
        <h3 className="text-2xl font-bold">Publish & Store</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-lg p-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Mint NFT
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 1,
                    }}
                    className="h-2 w-2 rounded-full bg-primary"
                  ></motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="rounded bg-muted p-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>URL:</span>
                      <span className="text-primary">someapes.com/322</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merkleroot:</span>
                      <span className="text-primary">0x32dfe268...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>id:</span>
                      <span className="text-primary">0xadc1556...</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <div className="rounded-lg text-muted-foreground shadow-sm p-6">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm text-muted-foreground mb-3"
              >
                Storage
              </motion.p>
              <div className="flex flex-row gap-4">
                <div className="bg-muted p-3 rounded-lg flex flex-col justify-between">
                  <div className="text-sm font-semibold mb-2">IMAGE</div>
                  <div className="w-16 h-24 bg-gradient-to-br from-gray-800 to-black rounded flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded"></div>
                  </div>
                </div>
                <div className="bg-muted flex-1 p-3 rounded">
                  <div className="text-sm font-semibold mb-2">ENCRYPTED</div>
                  <div className="flex gap-1 mb-2">
                    <div className="flex-1 bg-background h-8 flex items-center justify-center rounded text-xs font-mono">
                      enc0
                    </div>
                    <div className="flex-1 bg-background h-8 flex items-center justify-center rounded text-xs font-mono">
                      enc1
                    </div>
                    <div className="flex-1 bg-background h-8 flex items-center justify-center rounded text-xs font-mono">
                      encN
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      COORDINATES of encrypted parts
                    </div>
                    <div className="text-xs font-mono bg-background h-10 flex items-center justify-center rounded">
                      (x0,y0), (x1,y1), ... (xN,yN)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-lg p-4 flex flex-col justify-center h-full"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Publish to Marketplace
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                  }}
                  className="h-2 w-2 rounded-full bg-primary"
                ></motion.div>
              </div>
              <StaggerContainer
                className="grid grid-cols-3 gap-2"
                delay={0.7}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <StaggerItem key={i}>
                    <div className="aspect-square rounded bg-muted border relative overflow-hidden">
                      <div className="absolute inset-0 bg-background/80">
                        <div className="h-full w-full grid grid-cols-3 grid-rows-3">
                          {Array.from({ length: 9 }).map((_, j) => (
                            <div
                              key={j}
                              className={`${
                                [2, 5, 7].includes(j)
                                  ? "bg-muted-foreground/20"
                                  : "bg-background"
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-muted-foreground text-center"
        >
          The NFT is minted with references to the encrypted content, while the
          actual data is securely stored with coordinates for reconstruction.
        </motion.p>
      </AnimatedCard>
    </FadeUp>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-background flex justify-center border-b"
    >
      <div className="container pt-12 md:pt-24 lg:pt-32 border-l border-r">
        <FadeUp className="flex flex-col items-center justify-center space-y-4 text-center px-4 md:px-6">
          <div className="space-y-3 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm text-primary"
            >
              Technology
            </motion.div>
            <AnimatedText
              text="How It Works"
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
              Our advanced encryption and obfuscation technology secures your
              digital content.
            </motion.p>
          </div>
        </FadeUp>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2">
          <StepOne />
          <StepTwo />
          <StepThree />
        </div>
      </div>
    </section>
  );
}
