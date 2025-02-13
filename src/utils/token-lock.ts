import { TronWeb } from "tronweb";
import { Buffer } from "buffer";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

import {
  SHASTA_LOCK_CONTRACT,
  MAINNET_LOCK_CONTRACT,
  MAINNET_USDT_ADDRESS,
  SHASTA_USDT_ADDRESS,
} from "./constants";
import db from "./db";

/**
 * Deposits tokens into the TokenLock contract.
 * @param walletId - The ID of the user's wallet in your DB.
 * @param amount - The amount of tokens to lock.
 * @param lockDuration - The lock duration in seconds.
 * @param network - The network to use: 'shasta' or 'main'.
 */
export const deposit = async (
  walletId: string,
  amount: number,
  lockDuration: number,
  network: "shasta" | "main" = "main"
): Promise<string> => {
  const amountInWei = amount * 10 ** 6;

  // fetch wallet information from database
  const wallet = await db.getWallet(walletId);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // instantiate a TronWeb instance using the wallet's private key.
  const fullHost =
    network === "main"
      ? "https://api.trongrid.io"
      : "https://api.shasta.trongrid.io";

  const tronWebInstance = new TronWeb({
    fullHost,
    privateKey: wallet.privateKey,
  });

  // instantiate the usdt token contract
  const usdtAddress =
    network === "main" ? MAINNET_USDT_ADDRESS : SHASTA_USDT_ADDRESS;

  const contractAddress =
    network === "main" ? MAINNET_LOCK_CONTRACT : SHASTA_LOCK_CONTRACT;

  const usdtContract = await tronWebInstance.contract().at(usdtAddress);

  // approve the token lock contract to spend the user's tokens
  // first check allowance and approve infinite amount if needed
  try {
    const allowance = await usdtContract.allowance(
      wallet.address,
      contractAddress
    ).call();
    // convert allowance to number and compare with amountInWei
    const allowanceInNumber = Number(allowance); // converting allowance to number
    if (allowanceInNumber < amountInWei) {
      const approveTx = await usdtContract
        .approve(contractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') // approve infinite amount
        .send({
          from: wallet.address,
        });
      console.log(`Approval transaction sent: ${JSON.stringify(approveTx)}`);
    }
  } catch (error) {
    console.error("Error approving allowance", error);
    throw new Error("Does not have enough TRX");
  }

  // deposit tokens into the token lock contract
  const lockContract = await tronWebInstance.contract().at(contractAddress);

  const depositTx = await lockContract.deposit(amountInWei, lockDuration).send({
    from: wallet.address,
  });

  console.log(`Deposit transaction sent: ${JSON.stringify(depositTx)}`);

  return depositTx;
};

/**
 * Withdraws tokens from the TokenLock contract.
 * @param walletId - The ID of the user's wallet in your DB.
 * @param depositIndex - The index of the deposit to withdraw.
 * @param network - The network to use: 'shasta' or 'main'.
 */
export const withdraw = async (
  walletId: string,
  depositIndex: number,
  network: "shasta" | "main" = "main"
): Promise<string> => {
  // fetch wallet information from database
  const wallet = await db.getWallet(walletId);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // instantiate a TronWeb instance using the wallet's private key.
  const fullHost =
    network === "main"
      ? "https://api.trongrid.io"
      : "https://api.shasta.trongrid.io";

  const tronWebInstance = new TronWeb({
    fullHost,
    privateKey: wallet.privateKey,
  });

  const contractAddress =
    network === "main" ? MAINNET_LOCK_CONTRACT : SHASTA_LOCK_CONTRACT;

  const lockContract = await tronWebInstance.contract().at(contractAddress);

  // withdraw tokens from the token lock contract
  const withdrawTx = await lockContract.withdraw(depositIndex).send({
    from: wallet.address,
  });

  console.log(`Withdraw transaction sent: ${JSON.stringify(withdrawTx)}`);

  return withdrawTx;
};

export const getTransactionInfo = async (
  txId: string,
  network: "shasta" | "main"
) => {
  const fullHost =
    network === "main"
      ? "https://api.trongrid.io"
      : "https://api.shasta.trongrid.io";

  const tronWebInstance = new TronWeb({
    fullHost,
  });

  const tx = await tronWebInstance.trx.getTransaction(txId);

  return tx;
};
