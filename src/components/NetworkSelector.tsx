import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "../store";

const networks = [
  { id: "main", name: "TRON Mainnet" },
  { id: "shasta", name: "TRON Shasta Testnet" },
  // { id: "nile", name: "TRON Nile Testnet" },
];

export const NetworkSelector = () => {
  const {setNetwork, network} = useStore();

  const handleChange = (value: string) => {
    setNetwork(value as "main" | "shasta");
  };

  return (
    <Select defaultValue="main" value={network} onValueChange={handleChange}>
      <SelectTrigger className="w-[100px] md:w-[200px] bg-white/10 text-white border-white/20">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {networks.map((network) => (
          <SelectItem key={network.id} value={network.id}>
            {network.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};