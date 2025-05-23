import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/theme-provider";

import {
  createNetworkConfig,
  SuiClientProvider,
  useSuiClientContext,
  WalletProvider,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isEnokiNetwork, registerEnokiWallets } from "@mysten/enoki";
import { useEffect } from "react";

const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
});

const queryClient = new QueryClient();

function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    if (!isEnokiNetwork(network)) return;
    const { unregister } = registerEnokiWallets({
      apiKey: "enoki_public_f95fcebca592edfdcac5e97b11768802",
      providers: {
        google: {
          clientId:
            "250989217917-ch3gh5gs92q3i2d60cggpvtvo361vngg.apps.googleusercontent.com",
        },
        // Optional additional providers
        // facebook: { clientId: 'YOUR_FACEBOOK_CLIENT_ID' },
        // twitch: { clientId: 'YOUR_TWITCH_CLIENT_ID' },
      },
      client,
      network,
    });

    return unregister;
  }, [client, network]);

  return null;
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <RegisterEnokiWallets />
          <WalletProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
