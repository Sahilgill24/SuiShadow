"use client";

import { NavLink as Link } from "react-router";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";
import { ConnectModal } from "@mysten/dapp-kit";
import { Button } from "../ui/button";

const navLinks = [
  {
    href: "https://github.com/Sahilgill24/SuiShadow",
    label: "Features",
  },
  {
    href: "https://vimeo.com/1087307574?share=copy",
    label: "How It Works",
  },
  {
    href: "https://prezi.com/view/mLI25YPKScDHItzav4YN/",
    label: "Use Cases",
  },
];

export function Header() {

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-14 items-center justify-between gap-8 px-4 border-l border-r">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Ghost className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">Sui Shadow</span>
        </motion.div>
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex gap-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </motion.nav>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <ConnectModal
            trigger={
              <Button size="sm" className="rounded-full">
                Get Started
              </Button>
            }
          />
        </motion.div>
      </div>
    </header>
  );
}
