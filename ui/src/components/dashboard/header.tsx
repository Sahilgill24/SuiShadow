import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ghost, Plus, ShoppingBag, Wallet, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { type SortOption } from "@/lib/sample-data";
import {
  useAccounts,
  useCurrentAccount,
  useDisconnectWallet,
  useResolveSuiNSName,
} from "@mysten/dapp-kit";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { shortenAddress } from "@polymedia/suitcase-core";
import { useState } from "react";
import { toast } from "sonner";

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

export function Header({
  activeTab,
  setActiveTab,
  sortBy: _sortBy,
  setSortBy: _setSortBy,
}: HeaderProps) {
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
          <AccountInfo />
        </div>
      </div>
    </header>
  );
}

function AccountInfo() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { data: domain } = useResolveSuiNSName(
    currentAccount?.label ? null : currentAccount?.address
  );
  const accounts = useAccounts();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentAccount) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full px-4 flex items-center gap-2 hover:bg-accent/50 transition-colors"
        >
          <span className="font-mono font-bold">
            {currentAccount.label ??
              domain ??
              shortenAddress(currentAccount.address)}
          </span>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem
          onClick={copyAddress}
          className="cursor-pointer hover:bg-accent/50 flex items-center gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">Copy Address</span>
            <span className="text-xs text-muted-foreground font-mono">
              {shortenAddress(currentAccount.address)}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.address}
            className={
              currentAccount.address === account.address
                ? "bg-accent text-foreground "
                : ""
            }
            disabled={currentAccount.address === account.address}
          >
            {account.label ?? shortenAddress(account.address)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => disconnectWallet()}
          className="text-destructive focus:text-destructive"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
