import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { NFT } from "@/lib/types";
import { shortenAddress } from "@polymedia/suitcase-core";
import { LockIcon } from "lucide-react";

interface NFTCardProps {
  nft: NFT;
  onClick: () => void;
  delay?: number;
}

export function NFTCard({ nft, onClick, delay = 0 }: NFTCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border bg-card hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="relative">
            <img src={nft.image} alt={nft.name} className="object-cover" />
            {nft.isObfuscated && (
                <div className="absolute top-3 left-3">
                <div className="flex items-center gap-2 bg-background/90 rounded-full px-3 py-1">
                  <LockIcon className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Encrypted</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{nft.name}</h3>
              <p className="text-sm text-muted-foreground">
                by {shortenAddress(nft.creator)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {nft.metadata.description}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-primary">
                {nft.metadata.price} SUI
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
