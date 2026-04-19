interface DonorStatsProps {
  total: number;
  pending: number;
  inTransit: number;
  awaitingApproval: number;
}

export default function DonorStats({ total, pending, inTransit, awaitingApproval }: DonorStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 animate-fade-in-up">
      {[
        { label: "Total Missions", value: total,           color: "text-slate-100" },
        { label: "Pending Bids",   value: pending,         color: "text-amber-300" },
        { label: "In Transit",     value: inTransit,       color: "text-sky-300" },
        { label: "Need Approval",  value: awaitingApproval,color: "text-emerald-300" },
      ].map(({ label, value, color }) => (
        <div key={label} className="glass-panel rounded-2xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
