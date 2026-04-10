import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Donors Registry | Humanitarian Escrow",
  description: "Public registry of major organizations funding relief missions.",
};

const topDonors = [
  {
    name: "Global Health Fund",
    totalFunded: "4.2M USDC",
    missionsActive: 12,
    missionsCompleted: 84,
    focus: "Medical, Infrastructure",
  },
  {
    name: "UNICEF Aid",
    totalFunded: "3.8M USDC",
    missionsActive: 8,
    missionsCompleted: 112,
    focus: "Education, Nutrition",
  },
  {
    name: "European Relief Initiative",
    totalFunded: "1.5M USDC",
    missionsActive: 4,
    missionsCompleted: 35,
    focus: "Shelter, Logistics",
  },
];

export default function DonorsRegistryPage() {
  return (
    <AppShell currentPath="/donors">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
            Public Registry
          </span>
          <h1 className="font-(family-name:--font-fraunces) text-4xl font-semibold text-slate-50 md:text-5xl">
            Major Donors
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Organizations providing the capital that drives missions. All funds are locked in escrow and publicly verifiable before delivery begins.
          </p>
        </div>

        <div className="grid gap-6 animate-fade-in-up delay-100">
          {topDonors.map((donor, i) => (
            <div key={donor.name} className={`glass-card rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 ${i === 0 ? 'border-amber-400/30 bg-amber-400/5' : ''}`}>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-100 mb-1">{donor.name}</h2>
                <span className="text-sm font-medium text-amber-300/80 uppercase tracking-widest">{donor.focus}</span>
              </div>
              
              <div className="flex gap-8 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Missions</p>
                  <p className="text-sm text-slate-300 font-medium">
                    <span className="text-emerald-400">{donor.missionsActive} Active</span> 
                    <span className="mx-2 opacity-50">•</span> 
                    {donor.missionsCompleted} Done
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Deployed</p>
                  <p className="font-mono text-xl font-bold text-amber-300">{donor.totalFunded}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
