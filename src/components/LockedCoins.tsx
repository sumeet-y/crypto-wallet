import { useState, useEffect } from "react";
import { FaLock as Lock } from "react-icons/fa6";
import { CgLockUnlock as Unlock } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import { GoClock } from "react-icons/go";
import { useStore } from "@/store";
import { Notification } from "@mantine/core";
import { getTransactionInfo, withdraw } from "@/utils/token-lock";
import { getDeposits, getTransactions, getWalletInfo } from "@/utils/wallet";
import { notifications } from "@mantine/notifications";
import { GiTwoCoins } from "react-icons/gi";

interface Deposits {
  amount: number;
  unlockTime: number;
  withdrawn: boolean;
  depositIndex: number;
}

interface LockedCoinsProps {
  initialDeposits: Deposits[];
}

export const LockedCoins = ({ initialDeposits }: LockedCoinsProps) => {
  const [lockedCoins, setLockedCoins] = useState<Deposits[]>(initialDeposits);
  const {
    transactions,
    removeTransaction,
    setDeposits,
    currentWalletId,
    network,
    addTransaction,
    setCurrentWalletInfo,
    setTransactionHistory,
    currentFilter,
  } = useStore();

  const [failedTrxns, setFailedTrxns] = useState<
    {
      txId: string;
      title: string;
      message: string;
    }[]
  >([]);

  const formatTimeLeft = (unlockTime: number) => {
    const diff = unlockTime * 1000 - Date.now();
    if (diff <= 0) return "Unlockable";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // implement polling for transaction status using getTransactionInfo every 5 seconds
  // if transaction is confirmed with success, remove from transactions list using removeTransaction and call getDeposits to update lockedCoins and update store with setDeposits
  // if transaction results in error, show error notification with error message and close button
  // the getTransactionInfo takes a txId and returns the result using this function
  // const transaction = await tronweb.trx.getTransaction(txId);
  useEffect(() => {
    const id = setTimeout(() => {
      transactions.forEach(async (tx) => {
        try {
          const transaction = await getTransactionInfo(tx.txId, "shasta");
          if (transaction.ret[0].contractRet === "SUCCESS") {
            removeTransaction(tx.txId);

            const id = notifications.show({
              loading: true,
              color: "teal",
              title: `Fetching wallet detail`,
              message: "Please wait...",
              icon: null,
            });

            const walletInfo = await getWalletInfo(currentWalletId, network);
            setCurrentWalletInfo(walletInfo);

            notifications.update({
              id,
              loading: true,
              color: "teal",
              title: "Fetching Locked Coins",
              message: "Please wait...",
              icon: null,
            });

            const deposits = await getDeposits(currentWalletId, network);
            setDeposits(deposits);

            notifications.update({
              id,
              loading: false,
              color: "teal",
              title: "Locked Coins Fetched",
              message: "All locked coins have been fetched successfully",
              icon: null,
            });

            getTransactions(
              currentWalletId,
              network,
              currentFilter,
              10,
              1
            ).then((res) => {
              const { data } = res;
              setTransactionHistory(data);
            });
          } else if (transaction.ret[0].contractRet === "REVERT") {
            setFailedTrxns((prev) => [
              ...prev,
              {
                txId: tx.txId,
                title: failedMessage(tx.type, tx.amount),
                message: "Insufficient balance",
              },
            ]);
            removeTransaction(tx.txId);
          }
        } catch (error) {
          console.error(error);
          setFailedTrxns((prev) => [
            ...prev,
            {
              txId: tx.txId,
              title: failedMessage(tx.type, tx.amount),
              message: error.message,
            },
          ]);
          removeTransaction(tx.txId);
        }
      });
    }, 5000);

    if (transactions.length === 0) {
      clearTimeout(id);
    }

    return () => clearTimeout(id);
  }, [
    transactions,
    removeTransaction,
    setDeposits,
    currentWalletId,
    network,
    setCurrentWalletInfo,
    currentFilter,
    setTransactionHistory,
  ]);

  useEffect(() => {
    setLockedCoins(initialDeposits);
  }, [initialDeposits]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLockedCoins((prev) => [...prev]); // Force re-render to update timers
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pendingMessage = (type: "deposit" | "withdraw", amount: number) => {
    if (type === "deposit") {
      return `Pending USDT lock confirmation for $${amount}`;
    } else {
      return `Pending USDT unlock confirmation for $${amount}`;
    }
  };

  const failedMessage = (type: "deposit" | "withdraw", amount: number) => {
    if (type === "deposit") {
      return `Failed to lock $${amount}`;
    } else {
      return `Failed to unlock $${amount}`;
    }
  };

  const unLockCoin = async (depositIndex: number, amount: number) => {
    const id = notifications.show({
      title: "Unlocking USDT",
      message: "Please wait...",
      loading: true,
    });
    const withdrawTx = await withdraw(currentWalletId, depositIndex, network);

    addTransaction({
      type: "withdraw",
      txId: withdrawTx,
      amount,
    });

    notifications.update({
      id,
      loading: false,
      color: "teal",
      title: "USDT unlock request sent",
      message: `Transaction for unlocking ${amount} USDT has been sent`,
      icon: null,
    });
  };

  if (
    lockedCoins.length === 0 &&
    transactions.length === 0 &&
    failedTrxns.length === 0
  ) {
    return (
      <div className="p-4 rounded-lg bg-white/5">
        <h2 className="text-white text-xl font-bold ">Locked Coins</h2>
        <div className="flex justify-center items-center h-32">
          <p className="text-white/80 font-semibold text-lg flex items-center gap-2">
            <GiTwoCoins size={18} /> No locked coins
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white/5 rounded-lg p-4">
      <h2 className="text-white text-xl font-bold mb-4">Locked Coins</h2>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <Notification key={tx.txId} withCloseButton={false} loading={true}>
            {pendingMessage(tx.type, tx.amount)}
          </Notification>
        ))}

        {failedTrxns.map((tx) => (
          <>
            <Notification
              key={tx.txId}
              color="red"
              withCloseButton={true}
              onClose={() => {
                setFailedTrxns((prev) =>
                  prev.filter((t) => t.txId !== tx.txId)
                );
              }}
              title={tx.title}
            >
              {tx.message}
            </Notification>
          </>
        ))}
        {lockedCoins.map((coin, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-2  w-full">
              <Lock className="text-primary h-5 w-5" />
              <span className="text-white">
                {coin.amount}{" "}
                <span className="text-slate-400 font-semibold text-xs">
                  USDT
                </span>
              </span>
            </div>
            {coin.unlockTime * 1000 - Date.now() <= 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white w-52"
                onClick={() => unLockCoin(coin.depositIndex, coin.amount)}
              >
                <Unlock className="h-4 w-4 mr-1" />
                Unlock
              </Button>
            ) : (
              <span className="text-white/80 w-52 flex items-center gap-2  ">
                <span className="text-slate-400">
                  <GoClock />
                </span>
                <p className="flex justify-end">
                  {formatTimeLeft(coin.unlockTime)}
                </p>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
