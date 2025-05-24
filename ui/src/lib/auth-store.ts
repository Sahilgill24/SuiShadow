import { create } from 'zustand';

export type OpenIdProvider = 'Google';
export type AccountData = {
  provider: OpenIdProvider;
  userAddr: string;
  zkProofs: unknown;
  ephemeralPrivateKey: string;
  userSalt: string;
  sub: string;
  aud: string;
  maxEpoch: number;
};

export type AuthState = {
  loggedIn: boolean;
  accounts: AccountData[];
  balances: Map<string, number>;
  setAccounts: (accounts: AccountData[]) => void;
  clearAccounts: () => void;
  setBalances: (balances: Map<string, number>) => void;
  clearBalances: () => void;
};
export const useAuthStore = create<AuthState>((set) => ({
  loggedIn: false,
  accounts: [],
  balances: new Map(),
  setAccounts: (accounts) => set({ accounts, loggedIn: accounts.length > 0 }),
  clearAccounts: () => set({ accounts: [], loggedIn: false }),
  setBalances: (balances) => set({ balances }),
  clearBalances: () => set({ balances: new Map() }),
})); 