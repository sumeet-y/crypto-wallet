import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

import { WalletHeader } from "../components/WalletHeader";
import { WalletBalance } from "../components/WalletBalance";
import { WalletActions } from "../components/WalletActions";
import { BalanceList } from "../components/BalanceList";
import { LockedCoins } from "../components/LockedCoins";
import { useStore } from "../store";
import { getAllWallets, getDeposits, getWalletInfo } from "../utils/wallet";
import TransactionHistory from "@/components/TransactionHistory";

const Main = () => {
  const navigate = useNavigate();
  const {
    setWallets,
    network,
    currentWalletId,
    setCurrentWalletId,
    setCurrentWalletInfo,
    wallets,
    currentWalletInfo,
    setDeposits,
    deposits,
  } = useStore();

  useLayoutEffect(() => {
    const id = notifications.show({
      title: "Fetching all wallet ",
      message: "Please wait...",
      loading: true,
      color: "blue",
      icon: null,
      autoClose: 5000,
    });
    getAllWallets().then((data) => {
      if (data.length === 0) {
        navigate("/manage");
        return;
      }

      setWallets(data);
      let _currentWalletId = currentWalletId;
      if (!_currentWalletId) {
        setCurrentWalletId(data[0].id);
        _currentWalletId = data[0].id;
      }

      const wallet = data.find((wallet) => wallet.id === _currentWalletId);

      notifications.update({
        id,
        loading: true,
        color: "teal",
        title: `Fetching wallet detail for ${wallet.name}`,
        message: "Please wait...",
        icon: null,
      });

      getWalletInfo(_currentWalletId, network).then((info) => {        
        setCurrentWalletInfo(info);
        // notifications.update({
        //   id,
        //   loading: true,
        //   color: "teal",
        //   title: "Fetching Locked Coins",
        //   message: "Please wait...",
        //   icon: null,
        // });
      });

      getDeposits(_currentWalletId, network).then((deposits) => {
        setDeposits(deposits);
        notifications.update({
          id,
          loading: false,
          color: "teal",
          title: "Locked Coins Fetched",
          message: "All locked coins have been fetched successfully",
          icon: null,
        });
      });
    });
  }, [
    navigate,
    setWallets,
    currentWalletId,
    setCurrentWalletId,
    setCurrentWalletInfo,
    network,
    setDeposits,
  ]);

  return (
    <div className="min-h-screen bg-secondary ">
      <WalletHeader wallets={wallets} />
      <div className="max-w-2xl mx-auto mb-8">
        <WalletBalance
          address={currentWalletInfo.address}
          usdtBalance={Number(currentWalletInfo.balance.usdt)}
        />
        <WalletActions address={currentWalletInfo.address} />
        <BalanceList
          usdtBalance={Number(currentWalletInfo.balance.usdt)}
          trxBalance={Number(currentWalletInfo.balance.trx)}
        />
        <LockedCoins initialDeposits={deposits} />
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Main;
