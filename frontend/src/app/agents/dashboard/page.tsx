import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Agency Dashboard | Humanitarian Escrow",
  description: "Bid on missions, deliver aid, and build reputation.",
};

const mockAvailableMissions = [
  {
    id: "M-1045",
    title: "Cholera Response Kits",
    region: "Haiti, Port-au-Prince",
    maxBudget: "75,000 USDC",
    timeRemaining: "2 days left to bid",
    donor: "Global Health Fund",
  },
  {
    id: "M-1042",
    title: "Emergency Medical Supplies",
    region: "Sudan, Khartoum",
    maxBudget: "50,000 USDC",
    timeRemaining: "12 hours left to bid",
    donor: "UNICEF Aid",
  },
];

const mockActiveContracts = [
  {
    id: "M-1038",
    title: "Clean Water Infrastructure",
    region: "Yemen, Sana'a",
    lockedEscrow: "48,500 USDC",
    status: "In Transit",
    deadline: "Dec 15, 2026",
    actionRequired: "Mark Delivered",
  },
];

const mockPastDeliveries = [
  {
    id: "M-1012",
    title: "Food Rations (10,000 Meals)",
    region: "Gaza Strip",
    payout: "82,000 USDC",
    date: "Oct 12, 2026",
    status: "Approved",
  },
  {
    id: "M-0988",
    title: "Solar Generators",
    region: "Ukraine, Kyiv",
    payout: "115,000 USDC",
    date: "Sep 04, 2026",
    status: "Approved",
  },
];

export default function AgentsPage() {
  return (
    <AppShell currentPath="/agents">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        {/* Header & Agent Profile Stats */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end animate-fade-in-up">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              Agency Workspace
            </span>
            <h1 className="font-(family-name:--font-fraunces) text-4xl font-semibold text-slate-50 md:text-5xl">
              Red Cross Emergency
            </h1>
            <p className="mt-2 text-slate-400">
              Your operational command for bidding and delivery tracking.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-card rounded-2xl px-6 py-4 border-l-[3px] border-l-emerald-400">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Reputation Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-emerald-300">92</span>
                <span className="text-sm text-slate-500">/100</span>
              </div>
            </div>
            <div className="hidden sm:block glass-card rounded-2xl px-6 py-4 border-l-[3px] border-l-cyan-400">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Missions Delivered</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-cyan-300">47</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Contracts (High Priority) */}
        {mockActiveContracts.length > 0 && (
          <section className="mb-16 animate-fade-in-up delay-100">
            <h2 className="mb-6 text-xl font-semibold text-slate-100 flex items-center gap-3">
              Active Contracts
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-xs text-teal-300 border border-teal-500/30">
                {mockActiveContracts.length}
              </span>
            </h2>
            <div className="grid gap-6">
              {mockActiveContracts.map((contract) => (
                <div key={contract.id} className="glass-panel rounded-3xl p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex gap-3 mb-3">
                        <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                          {contract.id}
                        </span>
                        <span className="text-sm font-medium text-amber-400 border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                          {contract.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-100 mb-2">{contract.title}</h3>
                      <p className="text-slate-400 text-sm">
                        Region: <span className="text-slate-300 mr-4">{contract.region}</span>
                        Target Deadline: <span className="text-slate-300">{contract.deadline}</span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-6 border-t lg:border-t-0 border-white/10 pt-6 lg:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Locked in Escrow</p>
                        <p className="text-2xl font-mono text-emerald-300 font-bold">{contract.lockedEscrow}</p>
                      </div>
                      <button className="w-full sm:w-auto rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-6 py-3 text-sm font-semibold text-teal-300 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.15)] whitespace-nowrap">
                        {contract.actionRequired}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 animate-fade-in-up delay-200">
          {/* Mission Board (Available to Bid) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-100">Available to Bid</h2>
              <button className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors">
                View All Missions →
              </button>
            </div>
            <div className="space-y-4">
              {mockAvailableMissions.map((mission) => (
                <div key={mission.id} className="glass-card rounded-[1.25rem] p-5 hover:border-teal-400/30 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-slate-400">{mission.id}</span>
                    <span className="text-xs text-amber-400/80 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {mission.timeRemaining}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-teal-300 transition-colors">{mission.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{mission.region} • <span className="text-slate-500">By {mission.donor}</span></p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Max Budget</p>
                      <p className="font-mono text-sm text-slate-300">{mission.maxBudget}</p>
                    </div>
                    <button className="rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 px-4 py-2 transition-colors border border-teal-500/20">
                      Submit Pledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Past Deliveries */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-slate-100">Past Deliveries</h2>
            <div className="glass-panel rounded-3xl p-6">
              <div className="space-y-1">
                {mockPastDeliveries.map((delivery, i) => (
                  <div key={delivery.id} className={`flex items-center justify-between p-4 ${i !== mockPastDeliveries.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div>
                      <h4 className="font-medium text-slate-200">{delivery.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{delivery.region} • {delivery.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="block font-mono font-bold text-emerald-400">{delivery.payout}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70">
                        {delivery.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-xs font-medium text-slate-400 hover:text-slate-300 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                View Full History
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
