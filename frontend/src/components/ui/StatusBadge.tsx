import { MissionStatus } from "@/types/mission";

const CONFIG: Record<MissionStatus, { label: string; cls: string }> = {
  [MissionStatus.Pending]:          { label: "Pending Bids",     cls: "bg-amber-400/10 text-amber-300 border-amber-400/20" },
  [MissionStatus.InTransit]:        { label: "In Transit",       cls: "bg-sky-400/10 text-sky-300 border-sky-400/20" },
  [MissionStatus.AwaitingApproval]: { label: "Awaiting Approval",cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20" },
  [MissionStatus.Delivered]:        { label: "Delivered",        cls: "bg-emerald-600/10 text-emerald-400 border-emerald-600/20" },
  [MissionStatus.Disputed]:         { label: "Disputed",         cls: "bg-rose-400/10 text-rose-300 border-rose-400/20" },
  [MissionStatus.Resolved]:         { label: "Resolved",         cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export default function StatusBadge({ status }: { status: MissionStatus }) {
  const { label, cls } = CONFIG[status];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${cls}`}>
      {label}
    </span>
  );
}
