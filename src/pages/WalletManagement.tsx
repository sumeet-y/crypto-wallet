import { IoWalletOutline } from "react-icons/io5";
import { CiImport } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { IoMdArrowBack } from "react-icons/io";
import { createWallet } from "../utils/wallet";

const WalletManagement = () => {
  const navigate = useNavigate();

  const _createWallet = async () => {
    try {
      const wallet = await createWallet();
      navigate(`/${wallet.id}/mnemonic`);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Failed to create wallet",
        message: error.message,
        color: "red",
      });
    }
  };
  const _importWallet = async () => {
    navigate("/import");
  };
  return (
    <div className="bg-secondary h-screen">
      <button onClick={()=>navigate(-1)} className="rounded-md p-2 border hover:bg-white/5 text-white ml-5 mt-5">
        <IoMdArrowBack size={24} />
      </button>
      <div className="w-full  h-[90%] flex justify-center items-center">
      <div className="max-w-lg w-full flex flex-col gap-4 mx-4 transform -translate-y-[40%]">
          <h1 className="text-xl text-slate-200 ">Add Wallet</h1>
          <div className="flex flex-col gap-4">
            <button
              onClick={_createWallet}
              className="p-4 w-full border  border-slate-500 rounded-md hover:cursor-pointer flex items-center gap-2 hover:bg-white/10"
            >
              <span className="p-1 rounded-md bg-slate-50 text-black ">
                <IoWalletOutline size={18} />
              </span>
              <span className="text-xl text-slate-100">Create Wallet</span>
            </button>
            <button
              onClick={_importWallet}
              className="p-4 w-full border border-slate-400 rounded-md hover:cursor-pointer flex items-center gap-2 hover:bg-white/10"
            >
              <span className="p-1 rounded-md bg-slate-50 text-black ">
                <CiImport size={18} />
              </span>
              <span className="text-xl text-slate-100">Import Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
