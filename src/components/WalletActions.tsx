import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ReceiveModal } from "./ReceiveModal";
import { LockModal } from "./LockModal";
import { LuSend } from "react-icons/lu";
import { FiLock } from "react-icons/fi";

interface WalletActionsProps {
  address: string;
}

export const WalletActions = ({ address }: WalletActionsProps) => {
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center gap-4 pb-8"  >
        <Button 
          variant="ghost"
          disabled
          className="flex flex-col items-center justify-center gap-2 px-2">
          <span className="p-2 rounded-full bg-primary text-black flex justify-center items-center">
            <LuSend size={18}/>
          </span>
          <p className="text-slate-200">Send</p>
        </Button>

        <Button  
          variant="ghost"
          onClick={() => setIsReceiveModalOpen(true)}
          className="flex flex-col items-center justify-center gap-2 px-2 hover:bg-transparent">
          <span className="p-2 rounded-full bg-primary text-black flex justify-center items-center">
            <QrCode size={18}/>
          </span>
          <p className="text-slate-200">Receive</p>
        </Button>

        <Button 
          variant="ghost"
          onClick={() => { setIsLockModalOpen(true)}}
          className="flex flex-col items-center justify-center gap-2 px-2 hover:bg-transparent">
          <span className="p-2 rounded-full bg-primary text-black flex justify-center items-center">
            <FiLock size={18}/>
          </span>
          <p className="text-slate-200">Lock</p>
        </Button>
      </div>

      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        address={address}
      />

      <LockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
      />
    </>
  );
};