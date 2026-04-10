import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Verified Agencies | Humanitarian Escrow",
  description: "Public directory of relief agencies, their reputation scores, and delivery histories.",
};

const topAgencies = [
  {
    name: "Red Cross Emergency",
    reputation: 92,
    deliveries: 47,
    specialty: "Medical Relief & Crisis Response",
    status: "Accepting Bids",
  },
  {
    name: "Doctors Without Borders",
    reputation: 98,
    deliveries: 112,
    specialty: "Surgical & Emergency Medicine",
    status: "Accepting Bids",
  },
  {
    name: "World Central Kitchen",
    reputation: 95,
    deliveries: 89,
    specialty: "Food Distribution logistics",
    status: "At Capacity",
  },
  {
    name: "Local Relief Coalition",
    reputation: 75,
    deliveries: 12,
    specialty: "Regional Last-Mile Transport",
    status: "Accepting Bids",
  },
];

export default function AgentsRegistryPage() {
  return (
    <AppShell currentPath="/agents">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
            Public Registry
          </span>
          <h1 className="font-(family-name:--font-fraunces) text-4xl font-semibold text-slate-50 md:text-5xl">
            Verified Relief Agencies
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Organizations eligible to bid on escrow contracts. Reputation scores are calculated purely on successful, undisputed on-chain deliveries.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up delay-100">
          {topAgencies.map((agency) => (
            <div key={agency.name} className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-100">{agency.name}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    agency.status === "Accepting Bids" 
                      ? "text-teal-300 bg-teal-400/10 border-teal-400/20" 
                      : "text-slate-400 bg-white/5 border-white/10"
                  }`}>
                    {agency.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-8">{agency.specialty}</p>
              </div>
              
              <div className="flex items-end justify-between border-t border-white/5 pt-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Missions Delivered</p>
                  <p className="font-mono text-xl font-bold text-slate-200">{agency.deliveries}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Reputation Score</p>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className={`font-mono text-2xl font-bold ${agency.reputation > 90 ? 'text-teal-400' : 'text-amber-400'}`}>
                      {agency.reputation}
                    </span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
