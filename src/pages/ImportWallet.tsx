import { MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { notifications } from "@mantine/notifications";

import { importWallet } from "../utils/wallet";

const ImportWallet = () => {
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const _importWallet = async () => {
    try {
      await importWallet(textAreaRef.current.value);
      navigate("/");
    } catch (error) {
      notifications.show({
        title: "Failed to import wallet",
        message: error.message,
        color: "red",
      });
    }
  };

  return (
    <div className="bg-secondary h-screen w-full flex flex-col justify-center items-center">
      <div className="w-full max-w-lg p-7 border border-slate-500  rounded-lg ">
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-xl text-slate-200 ">Import wallet</h1>
          {/* delete button */}
          <button
            onClick={() => (textAreaRef.current.value = "")}
            className="hover:bg-white/5 p-1 rounded-md text-slate-400 hover:text-white "
          >
            <MdOutlineDelete size={22} />
          </button>
        </div>
        <div className="">
          <textarea
            name=""
            ref={textAreaRef}
            id=""
            className="max-w-lg w-full h-52 bg-white/5 p-4 rounded-lg text-white outline-none"
            placeholder="Paste or enter your mnemonic phrase here, with spaces."
          ></textarea>
          {/* <p className="text-red-500 text-xs font-light flex items-center gap-1"><MdErrorOutline /> Error while importing wallet</p> */}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={_importWallet}
            className="px-14 p-4 bg-blue-500 text-white rounded-md py-2  hover:cursor-pointer hover:bg-blue-600"
          >
            Import wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportWallet;
