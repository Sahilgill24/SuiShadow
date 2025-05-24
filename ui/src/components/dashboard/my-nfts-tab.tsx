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
  const packagid = '0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25';
  const { client } = useSuiClientContext();
  const [allowlistaddress, setAllowlistAddress] = useState("");
  const [nftName, setNftName] = useState("");
  const [userAllowlists, setUserAllowlists] = useState<any[]>([]);
  const [loadingAllowlists, setLoadingAllowlists] = useState(false);
  const currentAccount = useCurrentAccount();
  const id = '0x97fad43945130f277532b7891d47a81823d7990af6795b0ec4f9364c474eefda'

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


  async function trialfetch() {
    const ownedobjects = await client.getOwnedObjects({
      owner: currentAccount?.address ?? "",
      options: {
        showContent: true,
        showType: true,
      },
    });

    const filteredOwnedObjects = ownedobjects.data.filter((obj) => {
      // Check if the object is an NFT
      // @ts-ignore
      // These are the Allowlist Cap objects of the user
      if (obj.data?.type == "0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25::allowlist::Cap") {
        return true;
      }
      return false;
    });

    return filteredOwnedObjects;
  }
  async function fetchallowlist() {
    setLoadingAllowlists(true);
    try {
      // Fetch the allowlist Cap objects
      const objects = await trialfetch();
      const objects2 = objects;
      
      // @ts-ignore
      const objects_allowlist_ids = objects.map(obj => obj.data?.content?.fields?.allowlist_id);
      console.log("Objects Allowlist IDs:", objects);
      
      const final_allowlist_ids = await Promise.all(objects_allowlist_ids.map(async (id) => {
        // Fetch the full object details for each allowlist ID
        const allowlistObject = await client.getObject({
          id: id,
          options: {
            showContent: true,
            showType: true,
          }
        });
        return allowlistObject;
      }));
      
      console.log("Allowlist IDs:", final_allowlist_ids);
      
      // Process allowlists to get detailed information
      const allowlistsWithDetails = final_allowlist_ids.map((obj) => {
        try {
          // @ts-ignore
          const allowlistObjectId = obj.data?.objectId;
          // @ts-ignore
          const allowlistCapId = objects2.filter((capObj) => capObj.data?.content?.fields?.allowlist_id === allowlistObjectId)[0]?.data?.objectId || "";
          
          // @ts-ignore
          const addresses = obj.data?.content?.fields?.list || [];
          // @ts-ignore
          const name = obj.data?.content?.fields?.name || "Unnamed Allowlist";

          return {
            id: allowlistObjectId, // This is the actual allowlist object ID for transactions
            capId: allowlistCapId, // This is the Cap object ID
            name: name,
            addresses: addresses,
            totalAddresses: addresses.length
          };
        } catch (error) {
          console.error("Error processing allowlist details:", error);
          return {
            id: "Unknown",
            capId: "Unknown",
            name: "Unknown",
            addresses: [],
            totalAddresses: 0
          };
        }
      });

      setUserAllowlists(allowlistsWithDetails);
      return allowlistsWithDetails;
    } catch (error) {
      console.error("Error fetching allowlists:", error);
      setUserAllowlists([]);
      return [];
    } finally {
      setLoadingAllowlists(false);
    }
  }

  async function addtoAllowlist(address: string) {
    if (!address.trim()) {
      toast.error("Please enter a valid address");
      return;
    }

    if (!nftName.trim()) {
      toast.error("Please enter a valid NFT name");
      return;
    }

    try {
      // Get current allowlists to find the one matching the NFT name
      const allowlists = await fetchallowlist();
      const matchingAllowlist = allowlists.find((allowlist) =>
        allowlist.name === nftName
      );

      if (!matchingAllowlist || !matchingAllowlist.id) {
        toast.error(`No allowlist found for NFT name: ${nftName}`);
        return;
      }

      tx.moveCall({
        target: `${packagid}::allowlist::add`,
        arguments: [tx.object(matchingAllowlist.id), tx.object(matchingAllowlist.capId), tx.pure.address(address)],
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

      // Clear the input fields after successful addition
      setAllowlistAddress("");
      setNftName("");
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

    if (!nftName.trim()) {
      toast.error("Please enter a valid NFT name");
      return;
    }

    try {
      // Get current allowlists to find the one matching the NFT name
      const allowlists = await fetchallowlist();
      const matchingAllowlist = allowlists.find((allowlist) =>
        allowlist.name === nftName
      );

      if (!matchingAllowlist || !matchingAllowlist.id) {
        toast.error(`No allowlist found for NFT name: ${nftName}`);
        return;
      }
      console.log("Matching Allowlist:", matchingAllowlist.id);
      tx.moveCall({
        target: `${packagid}::allowlist::remove`,
        arguments: [tx.object(matchingAllowlist.id), tx.object(matchingAllowlist.capId), tx.pure.address(address)],
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

      // Clear the input fields after successful removal
      setAllowlistAddress("");
      setNftName("");
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
        blobIds.reverse();

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

  // Load allowlists when component mounts
  useEffect(() => {
    if (currentAccount?.address) {
      fetchallowlist();
    }
  }, [currentAccount?.address]);
  return (
    <>
      <HeroSection
        badge="My Collection"
        title="Your NFT Collection"
        description="View and manage your owned confidential NFTs. Only NFTs owned by your current address are displayed here with full access to revealed content and ownership proofs."
      />

      {/* Notification Placeholder */}
      <div className="container mx-auto px-4 md:px-6 pb-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Notification System Update
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Notifications for NFT owners to be updated soon, currently under maintenance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-8">
        {/* Allowlist Management Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Allowlist Management</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add or remove addresses from the allowlist to control access to your NFTs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Enter address to add/remove from allowlist"
                  value={allowlistaddress}
                  onChange={(e) => setAllowlistAddress(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Enter NFT name (must match existing allowlist name)"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={async () => await addtoAllowlist(allowlistaddress)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!allowlistaddress.trim() || !nftName.trim()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Allowlist
              </Button>
              <Button onClick={async () => await fetchallowlist()}>Refresh Allowlists</Button>

              <Button
                onClick={async () => await removeFromAllowlist(allowlistaddress)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!allowlistaddress.trim() || !nftName.trim()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Remove from Allowlist
              </Button>
            </div>
          </div>
        </div>

        {/* My Allowlists Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">My Allowlists</h3>
            <Button
              onClick={async () => await fetchallowlist()}
              variant="outline"
              disabled={loadingAllowlists}
              className="flex items-center gap-2"
            >
              {loadingAllowlists ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            View and manage all allowlists you have created for your NFTs.
          </p>

          {loadingAllowlists ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading allowlists...</span>
            </div>
          ) : userAllowlists.length === 0 ? (
            <div className="text-center p-8">
              <div className="text-muted-foreground mb-2">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-muted-foreground">No allowlists found</p>
              <p className="text-sm text-muted-foreground">Create your first allowlist to manage NFT access.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAllowlists.map((allowlist, index) => (
                <div key={allowlist.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        {allowlist.name || `Allowlist #${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        NFT Allowlist for access control
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {allowlist.totalAddresses}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">NFT Name:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {allowlist.name || "Unknown"}
                      </code>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Object ID:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {allowlist.id.slice(0, 8)}...{allowlist.id.slice(-8)}
                      </code>
                    </div>
                  </div>

                  {allowlist.addresses.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Allowed Addresses:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {allowlist.addresses.slice(0, 3).map((address: string, idx: number) => (
                          <div key={idx} className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                            {address.slice(0, 6)}...{address.slice(-6)}
                          </div>
                        ))}
                        {allowlist.addresses.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{allowlist.addresses.length - 3} more addresses
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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