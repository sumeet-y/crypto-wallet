import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";

// const wallets = [
//   { id: "wallet-1", name: "Wallet 1" },
//   { id: "wallet-2", name: "Wallet 2" },
// ];

export const WalletSelector = ({ wallets }) => {
  const { setCurrentWalletId, currentWalletId } =
    useStore();

  const handleChange = (value: string) => {
    setCurrentWalletId(value);
  };

  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue=""
        value={currentWalletId}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-[100px] md:w-[150px] bg-white/10 text-white border-white/20">
          <SelectValue placeholder="Select Wallet" />
        </SelectTrigger>
        <SelectContent>
          {wallets.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id}>
              {wallet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={() => navigate("/manage")}
        variant="outline"
        size="icon"
        className="text-white bg-white/10 border-white/20"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
