import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  marketplaceNFTs,
  myNFTs,
  sortNFTs,
  type SortOption,
} from "@/lib/sample-data";
import {
  Header,
  MarketplaceTab,
  MyNFTsTab,
  MintTab,
} from "@/components/dashboard";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [sortedMarketplaceNFTs, setSortedMarketplaceNFTs] =
    useState(marketplaceNFTs);
  const [sortedMyNFTs, setSortedMyNFTs] = useState(myNFTs);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSortedMarketplaceNFTs(sortNFTs(marketplaceNFTs, sortBy));
    setSortedMyNFTs(sortNFTs(myNFTs, sortBy));
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <main className="px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="marketplace" className="mt-0">
            <MarketplaceTab nfts={sortedMarketplaceNFTs} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="my-nfts" className="mt-0">
            <MyNFTsTab nfts={sortedMyNFTs} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="mint" className="mt-0">
            <MintTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
