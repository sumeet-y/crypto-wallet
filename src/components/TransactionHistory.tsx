import { GrTransaction } from "react-icons/gr";
import TranscationCoin from "./TranscationCoin";
import { useEffect } from "react";
import { useStore } from "@/store";
import { getTransactions } from "@/utils/wallet";

const TransactionHistory = () => {
  const { currentWalletId, network, transactionHistory, setTransactionHistory, currentFilter, setCurrentFilter } = useStore();

  useEffect(() => {
    getTransactions(currentWalletId, network, currentFilter, 10, 1).then(
      (res) => {
        const { data } = res;
        setTransactionHistory(data);
      }
    );
  }, [currentWalletId, network, currentFilter, setTransactionHistory]);

  const changeFilter = (filter: "all" | "trx" | "usdt") => {
    setCurrentFilter(filter);
  };

  return (
    <div className="p-4 rounded-lg bg-white/5 mt-4 ">
      <h2 className="text-white text-xl font-bold flex gap-2 items-end">Transaction History <span className="font-light text-sm text-white/70">(Last 10)</span></h2>
      <div className="flex  items-center  rounded-md my-4">
        <div className="grid grid-cols-3 gap-2 py-2  rounded-md">
          <button
            className={`rounded-full px-4 py-1 text-white font-semibold text-xs ${
              currentFilter === "all" ? "bg-blue-500" : "border border-gray-500"
            }`}
            onClick={() => changeFilter("all")}
          >
            All
          </button>
          <button
            className={`rounded-full px-4 py-1 text-white font-semibold text-xs ${
              currentFilter === "trx" ? "bg-blue-500" : "border border-gray-500"
            }`}
            onClick={() => changeFilter("trx")}
          >
            TRX
          </button>
          <button
            className={`rounded-full px-4 py-1 text-white font-semibold text-xs ${
              currentFilter === "usdt"
                ? "bg-blue-500"
                : "border border-gray-500"
            }`}
            onClick={() => changeFilter("usdt")}
          >
            USDT
          </button>
        </div>
      </div>
      <div className="space-y-4">

        {!transactionHistory.length && (
          <div className="flex justify-center items-center h-32">
            <p className="text-white/80 font-semibold text-lg flex items-center gap-2">
              <GrTransaction size={18} />
              No transactions history
            </p>
          </div>
        )}

        {transactionHistory.length > 0 &&
          transactionHistory.map((coin, index) => {
            return (
              <TranscationCoin
                key={index}
                status={coin.status}
                currency={coin.currency}
                amount={coin.amount}
                amountType={coin.amountType}
                time={coin.time}
                transacationStatus={coin.transactionStatus}
                link={coin.link}
              />
            );
          })}
      </div>
      {/* <div className="mt-4 flex justify-center items-center text-white p-2 ">
        <Pagination total={pageSize} color="#4E80EE" onChange={setPage} value={page} />
      </div> */}
    </div>
  );
};

export default TransactionHistory;
