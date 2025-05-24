import { HeroSection, NFTGrid } from "@/components/dashboard";
import { myNFTs } from "@/lib/sample-data";

interface MyNFTsTabProps {
  nfts: typeof myNFTs;
  isLoading: boolean;
}

export function MyNFTsTab({ nfts, isLoading }: MyNFTsTabProps) {
  return (
    <>
      <HeroSection
        badge="My Collection"
        title="Your NFT Collection"
        description="Manage and view your owned confidential NFTs with full access to revealed content and ownership proofs."
      />
      <div className="container mx-auto px-4 md:px-6 pb-12">
        <NFTGrid
          nfts={nfts}
          isLoading={isLoading}
          isMarketplace={false}
        />
      </div>
    </>
  );
} 