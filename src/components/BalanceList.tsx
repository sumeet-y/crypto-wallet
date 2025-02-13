import tether from '../assets/tether.png';
import trx from "../assets/trx.png"

export const BalanceList = ({usdtBalance, trxBalance}: {usdtBalance: number, trxBalance: number}) => {
  return (
    <div className=" pb-4 space-y-2 sm:space-y-0 sm:flex gap-4 items-center ">
      {/* <h2 className="text-white/80 text-lg mb-4">Coins</h2> */}
      <div className="flex w-full justify-between items-center p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img src={tether} alt="" className="" />
          </div>
          <span className="text-white">Tether </span>
        </div>
        <span className="text-white">
          {usdtBalance.toFixed(2)}{" "}
          <span className="text-slate-400 text-sm">USDT</span>
        </span>
      </div>
      
      <div className="flex w-full justify-between items-center p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8  rounded-full flex items-center justify-center">
            <img src={trx} alt="" className="" />
          </div>
          <span className="text-white">TRON </span>
        </div>
        <span className="text-white">
          {trxBalance.toFixed(2)}{" "}
          <span className="text-slate-400 text-sm">TRX</span>
        </span>
      </div>
    </div>
  );
};