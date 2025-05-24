import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ghost, Plus, ShoppingBag, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { sortOptions, type SortOption } from "@/lib/sample-data";
import { ZkLogin } from "@/components/zk-login/widget";

const tabs = [
  {
    id: "marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
  },
  {
    id: "my-nfts",
    label: "My NFTs",
    icon: Wallet,
  },
  {
    id: "mint",
    label: "Mint NFT",
    icon: Plus,
  },
];

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export function Header({ activeTab, setActiveTab, sortBy, setSortBy }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Ghost className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Sui Shadow</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 max-w-md mx-8"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </motion.div>
        <div className="flex gap-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          <motion.div className="div">
            <ZkLogin loggedOutTrigger={<></>} />
          </motion.div>
        </div>
      </div>
    </header>
  );
}
