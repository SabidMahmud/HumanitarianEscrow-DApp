import { RefreshCw } from "lucide-react";
import { truncateAddress } from "@/components/arbiter/utils";

interface ArbiterDashboardHeaderProps {
  address?: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function ArbiterDashboardHeader({
  address,
  isRefreshing,
  onRefresh,
}: ArbiterDashboardHeaderProps) {
  return (
    <div className="mb-12 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
          Arbiter Workspace
        </span>
        <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
          UN Arbiter Panel
        </h1>
        <p className="mt-2 text-slate-400 font-mono text-sm">
          {address ? truncateAddress(address) : "—"}
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}
