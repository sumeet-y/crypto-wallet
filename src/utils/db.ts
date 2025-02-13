import { openDB } from "idb";
import { init } from "@paralleldrive/cuid2";

const DB_NAME = "crypto-wallet";
const DB_VERSION = 1;
const STORE_NAME = "wallets";

export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

// Generate a unique ID of length 10
const generateId = init({
  length: 10,
});

interface Wallet {
  id: string;
  name: string;
  privateKey: string;
  address: string;
  mnemonic: string;
  createdAt: Date;
}

const saveWallet = async (wallet: {
  name: string;
  privateKey: string;
  address: string;
  mnemonic: string;
}): Promise<Wallet> => {
  // TODO: save private key and mnemonic in encrypted form
  const db = await initDB();
  const id = generateId();
  const createdAt = new Date();
  db.put(STORE_NAME, { id, ...wallet, createdAt });

  return { id, ...wallet, createdAt };
};

const getWallet = async (id: string): Promise<Wallet | null> => {
  const db = await initDB();
  return db.get(STORE_NAME, id) ?? null;
};

const getAllWallets = async (): Promise<Wallet[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

const deleteWallet = async (id: string) => {
  const db = await initDB();
  db.delete(STORE_NAME, id);
};

export default {
  saveWallet,
  getWallet,
  getAllWallets,
  deleteWallet,
};
