import { create } from "zustand";

interface Store {
  wallets: {
    id: string;
    name: string;
    address: string;
    mnemonic: string;
    createdAt: Date;
  }[];
  setWallets: (
    wallets: {
      id: string;
      name: string;
      address: string;
      mnemonic: string;
      createdAt: Date;
    }[]
  ) => void;

  network: "main" | "shasta";
  setNetwork: (network: "main" | "shasta") => void;

  currentWalletId: string | null;
  setCurrentWalletId: (walletId: string) => void;

  currentWalletInfo: {
    id: string;
    name: string;
    address: string;
    balance: {
      trx: string;
      usdt: string;
    };
  };
  setCurrentWalletInfo: (wallet: {
    id: string;
    name: string;
    address: string;
    balance: {
      trx: string;
      usdt: string;
    };
  }) => void;

  deposits: {
    amount: number;
    unlockTime: number;
    withdrawn: boolean;
    depositIndex: number;
  }[];
  setDeposits: (
    deposits: {
      amount: number;
      unlockTime: number;
      withdrawn: boolean;
      depositIndex: number;
    }[]
  ) => void;

  transactions: {
    type: "deposit" | "withdraw";
    txId: string;
    amount: number;
  }[];
  addTransaction: (transaction: {
    type: "deposit" | "withdraw";
    txId: string;
    amount: number;
  }) => void;
  removeTransaction: (txId: string) => void;

  transactionHistory: {
    id: string;
    status: string;
    transactionStatus: string;
    time: string;
    amount: number;
    amountType: string;
    currency: string;
    link: string
  }[];
  setTransactionHistory: (transactionHistory: {
    id: string;
    status: string;
    transactionStatus: string;
    time: string;
    amount: number;
    amountType: string;
    currency: string;
    link: string
  }[]) => void;
  
  currentFilter: "all" | "trx" | "usdt";
  setCurrentFilter: (currentFilter: "all" | "trx" | "usdt") => void;
}

export const useStore = create<Store>((set) => ({
  wallets: [],
  network: (localStorage.getItem("network") as "main" | "shasta") || "main",
  setWallets: (wallets) => set({ wallets }),
  setNetwork: (network) => {
    localStorage.setItem("network", network);
    set({ network });
  },
  currentWalletId: localStorage.getItem("currentWalletId"),
  setCurrentWalletId: (currentWalletId) => {
    localStorage.setItem("currentWalletId", currentWalletId);
    set({ currentWalletId });
  },
  currentWalletInfo: {
    id: "",
    name: "",
    address: "",
    balance: {
      trx: "",
      usdt: "",
    },
  },
  setCurrentWalletInfo: (currentWalletInfo) => set({ currentWalletInfo }),
  deposits: [],
  setDeposits: (deposits) => set({ deposits }),
  transactions: [],
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
  removeTransaction: (txId) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.txId !== txId),
    })),
  transactionHistory: [],
  setTransactionHistory: (transactionHistory) => set({ transactionHistory }),

  currentFilter: 'all',
  setCurrentFilter: (currentFilter) => set({ currentFilter }),
  
}));
