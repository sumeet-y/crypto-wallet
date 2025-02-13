import { HDKey } from "@scure/bip32";
import {
  mnemonicToSeedSync,
  generateMnemonic,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { bytesToHex } from "@noble/hashes/utils";
import { TronWeb } from "tronweb";
import { Buffer } from "buffer";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

import db from "./db";
import {
  MAINNET_LOCK_CONTRACT,
  MAINNET_USDT_ADDRESS,
  SHASTA_LOCK_CONTRACT,
  SHASTA_USDT_ADDRESS,
} from "./constants";

const tronWebMain = new TronWeb({
  fullHost: "https://api.trongrid.io", // Mainnet
});

const tronWebShasta = new TronWeb({
  fullHost: "https://api.shasta.trongrid.io", // Testnet
});

export const getAllWallets = async () => {
  return db.getAllWallets();
};

export const getMnemonic = async (walletId: string) => {
  const wallet = await db.getWallet(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }
  return wallet.mnemonic;
};

// Encrypt data using AES-256
// private encryptData(data: string, password: string): string {
//   return CryptoJS.AES.encrypt(data, password).toString();
// }

// Generate TRON account from mnemonic
const generateAccountFromMnemonic = (mnemonic: string) => {
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error("Invalid mnemonic");
  }

  const seed = mnemonicToSeedSync(mnemonic);
  // use hdkey to derive a key from the seed
  const hdNode = HDKey.fromMasterSeed(seed);
  // TRON's derivation path
  const derivationPath = "m/44'/195'/0'/0/0";
  const child = hdNode.derive(derivationPath);
  const privateKey = bytesToHex(child.privateKey);

  if (!privateKey) {
    throw new Error("Failed to generate private key");
  }

  const address = tronWebMain.address.fromPrivateKey(privateKey);

  if (!address) {
    throw new Error("Failed to generate address");
  }

  return { address, privateKey };
};

const generateWalletName = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let walletName = "Wallet-";
  for (let i = 0; i < 3; i++) {
    walletName += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return walletName;
};

// create wallet and save sensitive data encrypted to db
export const createWallet = async () => {
  const mnemonic = generateMnemonic(wordlist);
  const account = generateAccountFromMnemonic(mnemonic);

  // Encrypt sensitive data
  // const encryptedMnemonic = encryptData(mnemonic, password);
  // const encryptedPrivateKey = encryptData(account.privateKey, password);

  // save to database
  const name = generateWalletName();
  const wallet = await db.saveWallet({
    name,
    mnemonic,
    address: account.address,
    privateKey: account.privateKey,
  });

  return {
    id: wallet.id,
    name: wallet.name,
    mnemonic: wallet.mnemonic,
    address: wallet.address,
  };
};

export const importWallet = async (
  mnemonic: string
): Promise<{
  id: string;
  name: string;
  mnemonic: string;
  address: string;
}> => {
  if (mnemonic.trim().split(" ").length !== 12) {
    throw new Error("Invalid mnemonic, must be 12 words");
  }

  const account = generateAccountFromMnemonic(mnemonic.trim());
  const name = generateWalletName();
  const wallet = await db.saveWallet({
    name,
    mnemonic,
    address: account.address,
    privateKey: account.privateKey,
  });

  return {
    id: wallet.id,
    name: wallet.name,
    mnemonic: wallet.mnemonic,
    address: wallet.address,
  };
};

const getUSDTBalance = async (
  address: string,
  network: "main" | "shasta"
): Promise<string> => {
  const tronWeb = network === "main" ? tronWebMain : tronWebShasta;

  const contractAddress =
    network === "main" ? MAINNET_USDT_ADDRESS : SHASTA_USDT_ADDRESS;

  tronWeb.setAddress(contractAddress);
  const contract = await tronWeb.contract().at(contractAddress);
  const balance = await contract.balanceOf(address).call();
  return tronWeb.fromSun(balance).toString();
};

export const getWalletInfo = async (
  walletId: string,
  network: "shasta" | "main" = "main"
) => {
  const wallet = await db.getWallet(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const tronWeb = network === "main" ? tronWebMain : tronWebShasta;
  const trxBalance = await tronWeb.trx.getBalance(wallet.address);
  const usdtBalance = await getUSDTBalance(wallet.address, network);

  return {
    id: wallet.id,
    name: wallet.name,
    address: wallet.address,
    balance: {
      trx: tronWeb.fromSun(trxBalance).toString(),
      usdt: usdtBalance,
    },
  };
};

export const getDeposits = async (
  walletId: string,
  network: "shasta" | "main" = "main"
): Promise<
  {
    amount: number;
    unlockTime: number;
    withdrawn: boolean;
    depositIndex: number;
  }[]
> => {
  const wallet = await db.getWallet(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const fullHost =
    network === "main"
      ? "https://api.trongrid.io"
      : "https://api.shasta.trongrid.io";

  const tronWebInstance = new TronWeb({
    fullHost,
    privateKey: wallet.privateKey,
  });
  const lockContract =
    network === "main" ? MAINNET_LOCK_CONTRACT : SHASTA_LOCK_CONTRACT;

  const contract = await tronWebInstance.contract().at(lockContract);

  const depositCount = await contract.getDepositCount(wallet.address).call();

  const deposits = [];

  for (let i = 0; i < depositCount; i++) {
    const deposit = await contract.deposits(wallet.address, i).call();
    deposits.push(deposit);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedDeposits = deposits.map((deposit: any, index: number) => {
    return {
      amount: deposit.amount
        ? deposit.amount.toString()
        : deposit[0]
        ? deposit[0].toString()
        : "0",
      unlockTime: deposit.unlockTime
        ? deposit.unlockTime.toString()
        : deposit[1]
        ? deposit[1].toString()
        : "0",
      withdrawn:
        deposit.withdrawn !== undefined
          ? deposit.withdrawn
          : deposit[2] ?? false,
      depositIndex: index,
    };
  });

  // convert amount from sun, and unlockTime from timestamp
  transformedDeposits.forEach((deposit) => {
    deposit.amount = Number(tronWebInstance.fromSun(deposit.amount).toString());
    deposit.unlockTime = Number(deposit.unlockTime);
  });

  const finalDeposits = transformedDeposits.filter(
    (deposit) => !deposit.withdrawn
  );

  return finalDeposits;
};


/**
 * Fetch TRC-20 transaction history using the TronGrid API.
 */
// export const getTransactions = async (walletId: string, network: 'main' | 'shasta', limit = 10, page = 1) => {
//   const wallet = await db.getWallet(walletId);
//   if (!wallet) {
//     throw new Error("Wallet not found");
//   }

//   const address = wallet.address;
//   const url = network === 'main' ? 'https://apilist.tronscanapi.com' : 'https://shastapi.tronscan.org';

//   // Calculate offset based on page and limit
//   const offset = (page - 1) * limit;
//   // Build the TronGrid API URL for TRC-20 transactions
//   const trxUrl = `${url}/api/transaction?sort=-timestamp&count=true&limit=${limit}&start=${offset}&address=${address}`;
//   const usdtUrl = `${url}/api/filter/trc20/transfers?limit=${limit}&start=${offset}&sort=-timestamp&count=true&filterTokenValue=0&relatedAddress=${address}`;

//   // Use node-fetch to get the transaction data
//   const [trxResponse, usdtResponse] = await Promise.all([
//       axios.get(trxUrl, {
//         headers: {
//           "TRON-PRO-API-KEY": "3c4cd1b4-b1ca-49a1-a710-83c665c567d0",
//         },
//       }),
//       axios.get(usdtUrl, {
//         headers: {
//           "TRON-PRO-API-KEY": "3c4cd1b4-b1ca-49a1-a710-83c665c567d0",
//         },
//       }),
//   ]);
//   // const response = await fetch(url);
//   if (!(trxResponse.status === 200) || !(usdtResponse.status === 200)) {
//     throw new Error('Failed to fetch transactions');
//   }
//   const trxData = trxResponse.data;
//   const usdtData = usdtResponse.data;

//   const data = {
//     trx: trxData,
//     usdt: usdtData,
//   };
//   return data;
// }

/**
 * Fetch TRC-20 transaction history using the TronGrid API.
 */
export const getTransactions = async (
  walletId: string,
  network: 'main' | 'shasta',
  coin: 'trx' | 'usdt' | 'all' = 'all',
  limit = 10,
  page = 1
) => {
  const wallet = await db.getWallet(walletId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;
  const address = wallet.address;
  const url =
    network === 'main'
      ? 'https://api.trongrid.io'
      : 'https://api.shasta.trongrid.io';
  // Build the TronGrid API URL for TRC-20 transactions
  const trxUrl = `${url}/v1/accounts/${address}/transactions`;
  const usdtUrl = `${url}/v1/accounts/${address}/transactions/trc20`;

  // Only fetch the requested coin transactions based on the coin parameter
  let trxData = [],
    usdtData = [];
  let page_size_trx = 0, page_size_usdt = 0;
  if (coin === 'trx') {
    const trxResponse = await fetch(
      `${trxUrl}?limit=${limit}&offset=${offset}`
    );
    if (!trxResponse.ok) {
      throw new Error('Failed to fetch TRX transactions');
    }
    const res = await trxResponse.json();
    trxData = res.data;
    page_size_trx = res.meta.page_size;
  } else if (coin === 'usdt') {
    const usdtResponse = await fetch(
      `${usdtUrl}?limit=${limit}&offset=${offset}`
    );
    if (!usdtResponse.ok) {
      throw new Error('Failed to fetch USDT transactions');
    }
    const res = await usdtResponse.json();
    usdtData = res.data;
    page_size_usdt = res.meta.page_size;
  } else {
    // Fetch both if coin is 'all'
    const [trxResponse, usdtResponse] = await Promise.all([
      fetch(`${trxUrl}?limit=${limit / 2}&offset=${offset / 2}`),
      fetch(`${usdtUrl}?limit=${limit / 2}&offset=${offset / 2}`),
    ]);
    if (!trxResponse.ok || !usdtResponse.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const txRes = await trxResponse.json();
    const usdtRes = await usdtResponse.json();
    trxData = txRes.data;
    usdtData = usdtRes.data;
    page_size_trx = txRes.meta.page_size;
    page_size_usdt = usdtRes.meta.page_size;
  }
  const data = trxData.concat(usdtData);
  const page_size = page_size_trx + page_size_usdt;

  if (!data.length) {
    return { data: [], page_size:0};
  }

  // Sort the transactions by timestamp in descending order
  data.sort((a, b) => b.block_timestamp - a.block_timestamp);

  const hashToFunction = {
    e2bbb158: 'Lock',
    '2e1a7d4d': 'Unlock',
    '095ea7b3': 'Approve',
  };
  const getStatus = (raw_data_hex: string) => {
    const hashes = Object.keys(hashToFunction);
    for (const hash of hashes) {
      if (raw_data_hex.includes(hash)) {
        return hashToFunction[hash];
      }
    }
  };

  const getLink = (txId: string) => {
    return network === 'main'
      ? `https://tronscan.io/#/transaction/${txId}`
      : `https://shasta.tronscan.io/#/transaction/${txId}`;
  }

  const finalData = data.map(tx => {
    try {
      if ('type' in tx && tx.type !== 'Approval') {
        return {
          id: tx.transaction_id,
          status: tx.from === address ? 'Send' : 'Receive',
          transactionStatus: 'Success',
          time: new Date(tx.block_timestamp).toLocaleString(),
          amount: Number(tx.value) / 1e6,
          amountType: tx.from === address ? 'Deduct' : 'Credit',
          currency: 'USDT',
          link: getLink(tx.transaction_id),
        };
      } else if ('type' in tx && tx.type === 'Approval') {
        return null;
      } else {
        return {
          id: tx.txID,
          status: getStatus(tx.raw_data_hex),
          transactionStatus:
            tx.ret[0].contractRet === 'SUCCESS' ? 'Success' : 'Failed',
          time: new Date(tx.block_timestamp).toLocaleString(),
          amount: Number(tx.ret[0].fee) / 1e6,
          amountType: 'Deduct',
          currency: 'TRX',
          link: getLink(tx.txID),
        };
      }
    } catch (error) {
      return null;
    }
  }).filter(Boolean);
  return { data: finalData, page_size };
};