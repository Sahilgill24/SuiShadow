import { HeroSection } from "@/components/dashboard/hero-section";
import { NFTGrid } from "@/components/dashboard/nft-grid";
import { marketplaceNFTs } from "@/lib/sample-data";

interface MarketplaceTabProps {
  nfts: typeof marketplaceNFTs;
  isLoading: boolean;
}

export function MarketplaceTab({ nfts, isLoading }: MarketplaceTabProps) {
  return (
    <>
      <HeroSection
        badge="Marketplace"
        title="Discover Confidential NFTs"
        description="Explore a curated collection of encrypted digital assets with hidden features waiting to be revealed."
      />
      <div className="container mx-auto px-4 md:px-6 pb-12">
        <NFTGrid
          nfts={nfts}
          isLoading={isLoading}
          isMarketplace={true}
        />
      </div>
    </>
  );
} 