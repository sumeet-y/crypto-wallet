import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LuCopyCheck } from "react-icons/lu";
import { IoLockClosed } from "react-icons/io5";
import { useStore } from "@/store";


export const WalletBalance = ({address, usdtBalance}: {address:string, usdtBalance: number}) => {
   const [isCopied, setIsCopied] = useState(false);
   const {deposits}  = useStore();

  const lockedBalance = deposits.reduce((acc, deposit) => {
    if (deposit.withdrawn) return acc;
    return acc + deposit.amount;
  }, 0);
  
  const copyAddress = async () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    await navigator.clipboard.writeText(address);
    // toast({
    //   title: "Address copied!",
    //   description: "Wallet address has been copied to clipboard",
    // });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-b from-secondary to-secondary/80 rounded-lg mx-4 mt-4">

      <h1 className="text-5xl font-bold text-white">${usdtBalance.toFixed(2)} <span className="text-2xl text-slate-400">USDT</span> </h1>
     
      <h2 className="flex items-center space-x-2  ">
        <IoLockClosed className="text-white" />
        <span className="text-white font-semibold"> ${lockedBalance} <span className="text-slate-400 text-xs">USDT</span> </span>
      </h2>

      

      <div className="flex items-center justify-center space-x-2">
       <span className="text-white/80">{address}</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={copyAddress}
        >
          {!isCopied ? <Copy className="h-4 w-4" /> : <LuCopyCheck className="h-4 w-4 text-green-500" />}
        </Button>
      </div>
    </div>
  );
};