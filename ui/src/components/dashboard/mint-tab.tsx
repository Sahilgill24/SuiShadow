import { HeroSection, MintNFTForm } from "@/components/dashboard";

export function MintTab() {
  return (
    <>
      <HeroSection
        badge="Mint NFT"
        title="Mint a New NFT"
        description="Create a new NFT with a unique encrypted content and ownership proof."
      />
      <MintNFTForm />
    </>
  );
}
