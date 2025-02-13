import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
// import { IoCheckmark } from "react-icons/io5";
// import { set } from "date-fns";
import { useState } from "react";
import { LuCopyCheck } from "react-icons/lu";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export const ReceiveModal = ({ isOpen, onClose, address }: ReceiveModalProps) => {
  // const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive USDT</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-4">
          <div className="p-4 bg-white rounded-lg">
            <QRCode value={address} size={200} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{address}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAddress}
              className="h-8 w-8"
            >
              
            {!isCopied ? <Copy className="h-4 w-4" /> : <LuCopyCheck className="h-4 w-4 text-green-500" />}
            </Button>
            
            

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};