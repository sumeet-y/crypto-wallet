import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { deposit } from "@/utils/token-lock";
import { useStore } from "@/store";
import { FaCheck } from "react-icons/fa6";

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LockModal = ({ isOpen, onClose }: LockModalProps) => {
  const { currentWalletId, network, addTransaction } = useStore();
  const [amount, setAmount] = useState("");
  const [unlockDate, setUnlockDate] = useState("");

  const handleLock = async () => {
    const numAmount = parseFloat(amount);
    const unlockTime = new Date(unlockDate).getTime();

    if (isNaN(numAmount) || numAmount <= 0) {
      notifications.show({
        color: "red",
        title: "Invalid amount",
        message: "Please enter a valid amount greater than 0",
      });
      return;
    }

    if (isNaN(unlockTime) || unlockTime <= Date.now()) {
      notifications.show({
        color: "red",
        title: "Invalid date",
        message: "Please select a future date and time",
      });
      return;
    }
    // convert unlockTime to seconds from now
    const unlockTimeInSec = Math.floor((unlockTime - Date.now()) / 1000);

    const id = notifications.show({
      title: "Locking USDT",
      message: "Please wait...",
      loading: true,
    });
    try {
      const depositTx = await deposit(
        currentWalletId,
        numAmount,
        unlockTimeInSec,
        network
      );

      addTransaction({ type: "deposit", txId: depositTx, amount: numAmount });

      notifications.update({
        id,
        loading: false,
        color: "teal",
        title: "USDT locked successfully",
        message: `You have successfully locked ${numAmount} USDT`,
        icon: <FaCheck />,
      });
    } catch (error) {
      notifications.update({
        id,
        loading: false,
        color: "red",
        title: "An error occurred while locking USDT",
        message: error.message,
        autoClose: 5000,
      });
    }
    onClose();
    setAmount("");
    setUnlockDate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lock USDT</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (USDT)
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="unlockDate" className="text-sm font-medium">
              Unlock Date & Time
            </label>
            <Input
              id="unlockDate"
              type="datetime-local"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <Button onClick={handleLock} className="w-full">
            Lock USDT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
