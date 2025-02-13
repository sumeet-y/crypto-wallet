import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { FiLock } from "react-icons/fi";
import { FiUnlock } from "react-icons/fi";
import { LuSend } from "react-icons/lu";
import { MdCallReceived } from "react-icons/md";
import { GrShare } from "react-icons/gr";
import { GrTransaction } from "react-icons/gr";


const TranscationCoin = ({
  status,
  currency,
  amount,
  amountType,
  time,
  transacationStatus,
  link
}) => {
  return (
    <div className="bg-white/5 p-2 rounded-lg  flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div
          className={`${
            transacationStatus === "Failed" ? "bg-red" : "bg-green"
          } rounded-full p-3 w-fit `}
        >
          {status == "Approve" && (
            <IoCheckmarkDoneSharp
              size={15}
              className={`${
                transacationStatus === "Success" ? "text-green" : "text-red"
              }`}
            />
          )}
          {status == "Lock" && (
            <FiLock
              size={15}
              className={`${
                transacationStatus === "Success" ? "text-green" : "text-red"
              }`}
            />
          )}
          {status == "Unlock" && (
            <FiUnlock
              size={15}
              className={`${
                transacationStatus === "Success" ? "text-green" : "text-red"
              }`}
            />
          )}
          {status == "Send" && (
            <LuSend
              size={15}
              className={`${
                transacationStatus === "Success" ? "text-green" : "text-red"
              }`}
            />
          )}
          {status == "Receive" && (
            <MdCallReceived
              size={15}
              className={`${
                transacationStatus === "Success" ? "text-green" : "text-red"
              }`}
            />
          )}
          {status !== "Approve" && status !== "Lock" && status !== "Unlock" && status !== "Send" && status !== "Receive" && (
            <GrTransaction
              size={15}
              className={`${
                transacationStatus === "Success" ? "text-green" : "text-red"
              }`}
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-end ">
            <h2 className="font-semibold text-white text-lg">{status ? status : 'Transaction'}</h2>

            {transacationStatus == "Success" && (
              <p className="bg-green  py-1 rounded-full px-2 text-green font-medium flex items-center gap-1 text-xs">
                <MdDone className="text-green-400 font-bold" /> Success
              </p>
            )}
            {transacationStatus == "Failed" && (
              <p className="bg-red  py-1 rounded-full px-2 text-red font-medium flex items-center gap-1 text-xs">
                <RxCross2 className="text-red font-bold" size={15} /> Failed
              </p>
            )}
          </div>
          <p className="text-white/70 font-bold text-xs">{time}</p>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {amountType === "Deduct" && (
          <h2 className="text-red text-md font-semibold">
            -{amount} <span className="font-semibold text-xs">{currency}</span>
          </h2>
        )}
        {amountType === "Credit" && (
          <h2 className="text-green text-md font-semibold">
            +{amount} <span className="font-semibold text-xs">{currency}</span>
          </h2>
        )}
        {/* Wallet Link  */}
        <a
          href={link}
          target="_blank"
          className="bg-white/5 rounded-full p-2 text-white/70 hover:text-white hover:cursor-pointer"
        >
          <GrShare size={15} />
        </a>
      </div>
    </div>
  );
};

export default TranscationCoin;
