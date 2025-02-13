import { MdOutlineDone } from "react-icons/md";
import { VscClose } from "react-icons/vsc";
import { GoDotFill } from "react-icons/go";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

import Chip from "../components/Chip";
import { getMnemonic } from "../utils/wallet";

const CreateWallet = () => {
  const { walledId } = useParams();

  // get the mnemonic phrase
  const [mnemonic, setMnemonic] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMnemonic = async () => {
      try {
        const result = await getMnemonic(walledId);
        setMnemonic(result);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        notifications.show({
          title: "Failed to fetch mnemonic phrase",
          message: error.message,
          color: "red",
        });
        setIsLoading(false);
        navigate("/");
      }
    };

    fetchMnemonic();
  }, [walledId, navigate]);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="bg-secondary h-screen w-full flex flex-col justify-center items-center">
      <p className="text-white text-xl mb-5 font-semibold">
        Write down the mnemonic phrase in order.
      </p>
      <div className="w-full max-w-xl bg-white/5 border-slate-500 p-7 rounded-lg ">
        <div className="grid grid-cols-3 gap-4 ">
          {mnemonic.split(" ").map((word, index) => (
            <Chip chipsName={word} chipNo={index + 1} key={index} />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <h1 className="text-slate-200 text-md font-medium flex items-center gap-2">
              <MdOutlineDone size={15} className="text-green-500" />{" "}
              Recommended:
            </h1>
            <p className="text-sm text-slate-200">
              Write it down on a piece of paper and store somewhere secure.
            </p>
          </div>
          <div>
            <h1 className="text-slate-200 text-md font-medium flex items-center gap-2">
              <VscClose size={18} className="text-red-500" /> Avoid:
            </h1>
            <div className="text-sm text-slate-200">
              <p className="flex items-center gap-1">
                <GoDotFill size={7} className="text-white" /> Do not store the
                mnemonic phase on phone.
              </p>
              <p className="flex items-center gap-1">
                <GoDotFill size={7} className="text-white" /> Do not take a
                screenshot.
              </p>
              <p className="flex items-center gap-1">
                <GoDotFill size={7} className="text-white" /> Do not send the
                mnemonic phrase to anyone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-14 p-4 bg-blue-500 text-white rounded-md py-2  hover:cursor-pointer hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWallet;
