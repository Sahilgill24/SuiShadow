import { HeroSection } from "@/components/dashboard/hero-section";
import { NFTGrid } from "@/components/dashboard/nft-grid";
import { usePixelRemover } from "@/hooks/use-pixel-remover";
import { marketplaceNFTs } from "@/lib/sample-data";
import { useSuiClientContext } from "@mysten/dapp-kit";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface MarketplaceTabProps {
  nfts: typeof marketplaceNFTs;
  isLoading: boolean;
}

//@ts-ignore
export function MarketplaceTab({ nfts, isLoading }: MarketplaceTabProps) {
  const { client, network } = useSuiClientContext();
  const id = '0x97fad43945130f277532b7891d47a81823d7990af6795b0ec4f9364c474eefda'

  const [marketplaceNfts, setMarketplaceNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchBlobs(): Promise<string[]> {
    const blobs = await client.getObject({
      id: id,
      options: {
        showContent: true,
        showType: true,
      }
    })
    //@ts-ignore
    console.log('hello', blobs.data?.content?.fields.blobs);
    //@ts-ignore
    return blobs.data?.content?.fields.blobs || [];
  }
  // this will now 
  async function decoding(blobId: string): Promise<any> {
    const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
    const retrieveurl = `${AGGREGATOR}/v1/blobs/${blobId}`;
    const response2 = await axios({
      method: 'get',
      url: retrieveurl,
      responseType: 'arraybuffer'
    });

    console.log("Retrieved data:", response2.data);
    // Step 1: Convert ArrayBuffer to string
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(new Uint8Array(response2.data));

    // Step 2: Parse JSON
    const decodedPayload = JSON.parse(jsonString);
    return decodedPayload;
  }

  useEffect(() => {
    async function loadNfts() {
      setLoading(true);
      try {
        const blobIds = await fetchBlobs();
        const blobarray =blobIds.reverse()
        const decodedNfts = await Promise.all(
          
          blobIds.map(async (blobId, idx) => {
            let decoded;
            try {
              decoded = await decoding(blobId);
            } catch (err) {
              // Use base values if decoding fails
              decoded = {
                name: `NFT #${idx + 1}`,
                creator: "0x0000000000000000000000000000000000000000",
                description: "standard",
                price: 1,
                merkleRoot: "",
                obfuscatedImage: "/monkey.jpg"
              };
            }
            return {
              id: String(idx + 1),
              name: decoded.name || `NFT #${idx + 1}`,
              creator: decoded.addres || "0x0000000000000000000000000000000000000000",
              metadata: {
                description: decoded.description || "NFT Minted",
                price: decoded.price || 1.5,
              },
              merkleroot: decoded.merkleRoot || "",
              image: decoded.obfuscatedImage || decoded.url || "/download.png",
              isObfuscated: "true",
            };
          })
        );
        setMarketplaceNfts(decodedNfts);
      } catch (e) {
        setMarketplaceNfts([]);
      }
      setLoading(false);
    }
    loadNfts();
  }, []);

  return (
    <>
      <HeroSection
        badge="Marketplace"
        title="Discover Confidential NFTs"
        description="Explore a curated collection of encrypted digital assets with hidden features waiting to be revealed."
      />
      <div className="container mx-auto px-4 md:px-6 pb-12">
        <NFTGrid
          nfts={marketplaceNfts}
          isLoading={loading}
          isMarketplace={true}
        />


      </div>

    </>
  );
}