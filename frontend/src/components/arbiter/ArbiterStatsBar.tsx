import { formatEther } from "ethers";
import { AlertTriangle, ArrowDownToLine, Coins, Loader2 } from "lucide-react";

interface ArbiterStatsBarProps {
  disputedCount: number;
  accumulatedFees: bigint;
  isWithdrawingFees: boolean;
  onWithdrawFees: () => void;
}

export default function ArbiterStatsBar({
  disputedCount,
  accumulatedFees,
  isWithdrawingFees,
  onWithdrawFees,
}: ArbiterStatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-fade-in-up">
      <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Disputed Missions
          </p>
          <p className="text-2xl font-bold text-slate-100">{disputedCount}</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Accumulated Fees
          </p>
          <p className="text-2xl font-bold font-mono text-slate-100">
            {formatEther(accumulatedFees)} ETH
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
            Treasury
          </p>
        </div>
        <button
          onClick={onWithdrawFees}
          disabled={accumulatedFees === 0n || isWithdrawingFees}
          className="ml-4 shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-4 py-2.5 text-sm font-semibold text-violet-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isWithdrawingFees ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowDownToLine className="w-4 h-4" />
          )}
          Withdraw
        </button>
      </div>
    </div>
  );
}
