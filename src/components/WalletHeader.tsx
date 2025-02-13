import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkSelector } from "./NetworkSelector";
import { WalletSelector } from "./WalletSelector";
import { MdOutlineBackup } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { getDeposits, getTransactions, getWalletInfo } from "@/utils/wallet";
import { notifications } from "@mantine/notifications";

export const WalletHeader = ({ wallets }) => {
  const {
    setCurrentWalletInfo,
    currentWalletId,
    network,
    setDeposits,
    currentFilter,
    setTransactionHistory,
  } = useStore();

  const refresh = () => {
    const id = notifications.show({
      loading: true,
      color: "teal",
      title: `Fetching wallet detail`,
      message: "Please wait...",
      icon: null,
      autoClose: 5000,
    });
    getWalletInfo(currentWalletId, network).then((info) => {
      setCurrentWalletInfo(info);

      notifications.update({
        id,
        loading: true,
        color: "teal",
        title: "Fetching Locked Coins",
        message: "Please wait...",
        icon: null,
      });
    });
    getDeposits(currentWalletId, network).then((deposits) => {
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

    getTransactions(currentWalletId, network, currentFilter, 10, 1).then(
      (res) => {
        const { data } = res;
        setTransactionHistory(data);
      }
    );
  };

  const navigate = useNavigate();
  return (
    <div className="flex  justify-between items-center w-full px-4 py-3 bg-secondary relative">
      <NetworkSelector />
      <div className="ml-auto mr-auto absolute left-1/2 transform -translate-x-1/2">
        <WalletSelector wallets={wallets} />
      </div>

      <div className="flex gap-4">
        {/* refresh button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white flex items-center h-fit gap-2 w-fit p-2"
          onClick={refresh}
        >
          <RefreshCw />
          <p className="hidden md:block">Refresh</p>
        </Button>

        {/* Backup button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white flex items-center h-fit gap-2 w-fit p-2"
          onClick={() => navigate(`${currentWalletId}/mnemonic`)}
        >
          <MdOutlineBackup />
          <p className="hidden md:block">Backup</p>
        </Button>
      </div>
    </div>
  );
};
