import { HeroSection, NFTGrid } from "@/components/dashboard";
import { myNFTs } from "@/lib/sample-data";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientContext } from "@mysten/dapp-kit";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";

interface MyNFTsTabProps {
  nfts: typeof myNFTs;
  isLoading: boolean;
}
//@ts-ignore
export function MyNFTsTab({ nfts, isLoading }: MyNFTsTabProps) {
  const currentaddress = useCurrentAccount();
  const { client, network } = useSuiClientContext();
  const [allowlistaddress, setAllowlistAddress] = useState("");
  const id = '0x97fad43945130f277532b7891d47a81823d7990af6795b0ec4f9364c474eefda'
  const packagid = '0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25';
  const [marketplaceNfts, setMarketplaceNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const tx = new Transaction();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  async function fetchBlobs(): Promise<string[]> {
    const blobs = await client.getObject({
      id: id,
      options: {
        showContent: true,
        showType: true,
      }
    })
    //@ts-ignore
    console.log('fetching blobs from marketplace', blobs.data?.content?.fields.blobs);
    //@ts-ignore
    return blobs.data?.content?.fields.blobs || [];
  }

  async function addtoAllowlist(address: string) {
    if (!address.trim()) {
      toast.error("Please enter a valid address");
      return;
    }

    try {
      
      tx.moveCall({
        target: `${packagid}::allowlist::add`,
        arguments: [tx.object('0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9'), tx.object('0x3e6403d05347b21d05f984bbe2e731b6ac3f7b3581f5d489ebb5cf3af59445b4'), tx.pure.address(address)],
      });

      tx.setGasBudget(1000000000);
      const result2 = await signAndExecuteTransaction({
        // @ts-ignore
        transaction: tx,
        chain: 'sui:testnet'
      });
      console.log("Transaction executed with digest:", result2);

      // Show toast for allowlist addition
      toast.success("Address Added to Allowlist!", {
        description: `Added to Allowlist Successfully`,
        action: {
          label: "SuiScan",
          // @ts-ignore
          onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${result2.digest}`, '_blank')
        },
        duration: 4000,
        position: "top-right",
      });

      // Clear the input field after successful addition
      setAllowlistAddress("");
    } catch (error) {
      console.error("Error adding to allowlist:", error);
      toast.error("Failed to add address to allowlist", {
        description: "Please try again",
        duration: 4000,
        position: "top-right",
      });
    }

    
  }

  async function removeFromAllowlist(address: string) {
    if (!address.trim()) {
      toast.error("Please enter a valid address");
      return;
    }

    try {
      
      tx.moveCall({
        target: `${packagid}::allowlist::remove`,
        arguments: [tx.object('0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9'), tx.object('0x3e6403d05347b21d05f984bbe2e731b6ac3f7b3581f5d489ebb5cf3af59445b4'), tx.pure.address(address)],
      });

      tx.setGasBudget(1000000000);
      const result = await signAndExecuteTransaction({
        // @ts-ignore
        transaction: tx,
        chain: 'sui:testnet'
      });
      console.log("Remove transaction executed with digest:", result);

      // Show toast for allowlist removal
      toast.success("Address Removed from Allowlist!", {
        description: `Removed from Allowlist Successfully`,
        action: {
          label: "SuiScan",
          // @ts-ignore
          onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${result.digest}`, '_blank')
        },
        duration: 4000,
        position: "top-right",
      });

      // Clear the input field after successful removal
      setAllowlistAddress("");
    } catch (error) {
      console.error("Error removing from allowlist:", error);
      toast.error("Failed to remove address from allowlist", {
        description: "Please try again",
        duration: 4000,
        position: "top-right",
      });
    }
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
        const blobarray = blobIds.reverse();

        // First, decode all NFTs and filter by current address
        const allDecodedNfts = await Promise.all(
          blobIds.slice(0, 12).map(async (blobId, idx) => {
            let decoded;
            try {
              decoded = await decoding(blobId);
            } catch (err) {
              // Use base values if decoding fails
              decoded = {
                name: `NFT #${idx + 1}`,
                creator: "0x0000000000000000000000000000000000000000",
                addres: "0x0000000000000000000000000000000000000000",
                description: "standard",
                price: 1,
                merkleRoot: "",
                obfuscatedImage: "/monkey.jpg"
              };
            }
            return {
              id: String(idx + 1),
              name: decoded.name || `NFT #${idx + 1}`,
              creator: decoded.addres,
              metadata: {
                description: decoded.description || "NFT Minted",
                price: decoded.price || 1.5,
              },
              merkleroot: decoded.merkleRoot || "",
              image: decoded.obfuscatedImage || decoded.url || "/download.png",
              isObfuscated: "true",
              ownerAddress: decoded.addres, // Store the owner address for filtering
            };
          })
        );

        // Filter NFTs to show only those owned by the current address
        const ownedNfts = allDecodedNfts.filter(nft => {
          console.log("Filtering - current address:", currentaddress?.address, "NFT owner:", nft.ownerAddress);
          return nft.ownerAddress === currentaddress?.address;
        });

        setMarketplaceNfts(ownedNfts);
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
        badge="My Collection"
        title="Your NFT Collection"
        description="View and manage your owned confidential NFTs. Only NFTs owned by your current address are displayed here with full access to revealed content and ownership proofs."
      />
      <div className="container mx-auto px-4 md:px-6 pb-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Allowlist Management</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add or remove addresses from the allowlist to control access to your NFTs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                className="w-full"
                placeholder="Enter address to add/remove from allowlist"
                value={allowlistaddress}
                onChange={(e) => setAllowlistAddress(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={async () => await addtoAllowlist(allowlistaddress)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!allowlistaddress.trim()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Allowlist
              </Button>
              
              <Button 
                onClick={async () => await removeFromAllowlist(allowlistaddress)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!allowlistaddress.trim()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Remove from Allowlist
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pb-12">
        <NFTGrid
          nfts={marketplaceNfts}
          isLoading={loading}
          isMarketplace={false}
        />

      </div>
    </>
  );
} 