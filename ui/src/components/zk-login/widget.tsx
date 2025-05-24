import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import {
  genAddressSeed,
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/zklogin";
import {
  type NetworkName,
  makePolymediaUrl,
  requestSuiFromFaucet,
  shortenAddress as shortenSuiAddress,
} from "@polymedia/suitcase-core";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import config from "./config.json";
import { ArrowRightIcon, UserIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/auth-store";
import type { AccountData, OpenIdProvider } from "@/lib/auth-store";

const NETWORK: NetworkName = "devnet";
const MAX_EPOCH = 2;

const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

const setupDataKey = "zklogin-demo.setup";

type SetupData = {
  provider: OpenIdProvider;
  maxEpoch: number;
  randomness: string;
  ephemeralPrivateKey: string;
};

function isSetupData(obj: unknown): obj is SetupData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "provider" in obj &&
    "maxEpoch" in obj &&
    "randomness" in obj &&
    "ephemeralPrivateKey" in obj
  );
}

export const ZkLogin: React.FC<{
  loggedInTrigger?: React.ReactNode;
  loggedOutTrigger: React.ReactNode;
}> = ({ loggedInTrigger, loggedOutTrigger }) => {
  const {
    loggedIn,
    accounts,
    balances,
    setAccounts,
    clearAccounts,
    setBalances,
    clearBalances,
  } = useAuthStore();

  useEffect(() => {
    completeZkLogin();
    fetchBalances(accounts);
    const interval = setInterval(() => fetchBalances(accounts), 5_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  async function beginZkLogin(provider: OpenIdProvider) {
    const { epoch } = await suiClient.getLatestSuiSystemState();
    const maxEpoch = Number(epoch) + MAX_EPOCH;
    const ephemeralKeyPair = new Ed25519Keypair();
    const randomness = generateRandomness();
    const nonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      maxEpoch,
      randomness
    );
    saveSetupData({
      provider,
      maxEpoch,
      randomness: randomness.toString(),
      ephemeralPrivateKey: ephemeralKeyPair.getSecretKey(),
    });
    const urlParamsBase = {
      nonce: nonce,
      redirect_uri: "http://localhost:5173/",
      response_type: "id_token",
      scope: "openid",
    };
    let loginUrl: string;
    switch (provider) {
      case "Google": {
        const urlParams = new URLSearchParams({
          ...urlParamsBase,
          client_id: config.CLIENT_ID_GOOGLE,
        });
        loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${urlParams.toString()}`;
        break;
      }
    }
    window.location.replace(loginUrl);
  }

  async function completeZkLogin() {
    const urlFragment = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(urlFragment);
    const jwt = urlParams.get("id_token");
    if (!jwt) return;
    window.history.replaceState(null, "", window.location.pathname);
    const jwtPayload = jwtDecode(jwt);
    if (!jwtPayload.sub || !jwtPayload.aud) return;
    const requestOptions =
      config.URL_SALT_SERVICE === "/dummy-salt-service.json"
        ? { method: "GET" }
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jwt }),
          };
    const saltResponse: { salt: string } | null = await fetch(
      config.URL_SALT_SERVICE,
      requestOptions
    )
      .then((res) => res.json())
      .catch(() => null);
    if (!saltResponse) return;
    const userSalt = BigInt(saltResponse.salt);
    const userAddr = jwtToAddress(jwt, userSalt);
    const setupData = loadSetupData();
    if (!isSetupData(setupData)) return;
    clearSetupData();
    if (accounts.some((a) => a.userAddr === userAddr)) return;
    const ephemeralKeyPair = keypairFromSecretKey(
      setupData.ephemeralPrivateKey
    );
    const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
    const payload = JSON.stringify(
      {
        maxEpoch: setupData.maxEpoch,
        jwtRandomness: setupData.randomness,
        extendedEphemeralPublicKey:
          getExtendedEphemeralPublicKey(ephemeralPublicKey),
        jwt,
        salt: userSalt.toString(),
        keyClaimName: "sub",
      },
      null,
      2
    );
    const zkProofs = await fetch(config.URL_ZK_PROVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    })
      .then((res) => res.json())
      .catch(() => null);
    if (!zkProofs || typeof zkProofs !== "object") return;
    setAccounts([
      {
        provider: setupData.provider,
        userAddr,
        zkProofs: { ...zkProofs },
        ephemeralPrivateKey: setupData.ephemeralPrivateKey,
        userSalt: userSalt.toString(),
        sub: jwtPayload.sub,
        aud:
          typeof jwtPayload.aud === "string"
            ? jwtPayload.aud
            : jwtPayload.aud[0],
        maxEpoch: setupData.maxEpoch,
      },
      ...accounts,
    ]);
  }

  async function sendTransaction(account: AccountData) {
    const tx = new Transaction();
    tx.setSender(account.userAddr);
    const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
    const { bytes, signature: userSignature } = await tx.sign({
      client: suiClient,
      signer: ephemeralKeyPair,
    });
    const addressSeed = genAddressSeed(
      BigInt(account.userSalt),
      "sub",
      account.sub,
      account.aud
    ).toString();
    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        ...(typeof account.zkProofs === "object" && account.zkProofs !== null
          ? account.zkProofs
          : {}),
        addressSeed,
      },
      maxEpoch: account.maxEpoch,
      userSignature,
    });
    await suiClient
      .executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
        options: { showEffects: true },
      })
      .then(() => fetchBalances([account]))
      .catch(() => null);
  }

  function keypairFromSecretKey(privateKeyBase64: string): Ed25519Keypair {
    const keyPair = decodeSuiPrivateKey(privateKeyBase64);
    return Ed25519Keypair.fromSecretKey(keyPair.secretKey);
  }

  async function fetchBalances(accounts: AccountData[]) {
    if (accounts.length === 0) return;
    const newBalances = new Map<string, number>();
    for (const account of accounts) {
      const suiBalance = await suiClient.getBalance({
        owner: account.userAddr,
        coinType: "0x2::sui::SUI",
      });
      newBalances.set(
        account.userAddr,
        +suiBalance.totalBalance / 1_000_000_000
      );
    }
    setBalances(newBalances);
  }

  function saveSetupData(data: unknown) {
    sessionStorage.setItem(setupDataKey, JSON.stringify(data));
  }
  function loadSetupData(): unknown | null {
    const dataRaw = sessionStorage.getItem(setupDataKey);
    if (!dataRaw) return null;
    return JSON.parse(dataRaw);
  }
  function clearSetupData(): void {
    sessionStorage.removeItem(setupDataKey);
  }
  function clearState(): void {
    sessionStorage.clear();
    clearAccounts();
    clearBalances();
  }

  if (loggedIn) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {loggedInTrigger ? (
            loggedInTrigger
          ) : (
            <Button variant="outline" size="icon" className="rounded-full">
              <UserIcon className="w-5 h-5" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent>
          <h2 className="text-lg font-semibold mb-4">Accounts</h2>
          <div className="space-y-6">
            {accounts.map((acct) => {
              const balance = balances.get(acct.userAddr);
              const explorerLink = makePolymediaUrl(
                NETWORK,
                "address",
                acct.userAddr
              );
              return (
                <div key={acct.userAddr} className="bg-muted p-4 rounded-lg">
                  <div className="mb-2">
                    <span
                      className={`inline-block px-2 py-1 text-sm font-medium rounded ${
                        acct.provider === "Google"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {acct.provider}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      Address:{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={explorerLink}
                        className="text-primary hover:underline"
                      >
                        {shortenSuiAddress(acct.userAddr)}
                      </a>
                    </div>
                    <div>User ID: {acct.sub}</div>
                    <div>
                      Balance:{" "}
                      {typeof balance === "undefined"
                        ? "(loading)"
                        : `${balance} SUI`}
                    </div>
                  </div>
                  <div className="mt-4 space-x-2">
                    <button
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        !balance
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      disabled={!balance}
                      onClick={() => {
                        sendTransaction(acct);
                      }}
                    >
                      Send transaction
                    </button>
                    {balance === 0 && (
                      <button
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm font-medium hover:bg-secondary/90"
                        onClick={() => {
                          requestSuiFromFaucet(NETWORK, acct.userAddr);
                        }}
                      >
                        Use faucet
                      </button>
                    )}
                  </div>
                  <div className="mt-4 border-t border-border" />
                  <div className="flex justify-center">
                    <Button
                      variant={"destructive"}
                      className="w-full"
                      onClick={clearState}
                    >
                      Log Out
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  } else {
    return (
      <Popover>
        <PopoverTrigger asChild>{loggedOutTrigger}</PopoverTrigger>
        <PopoverContent className="space-y-2">
          <Button
            variant={"outline"}
            className="w-full"
            size={"lg"}
            onClick={() => beginZkLogin("Google")}
          >
            ZkLogin with Google <ArrowRightIcon />
          </Button>
        </PopoverContent>
      </Popover>
    );
  }
};
