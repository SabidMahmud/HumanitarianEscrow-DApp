import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Arbiter Dashboard | Humanitarian Escrow",
  description: "Resolve mission disputes and authorize escrow routing.",
};

const mockDisputedMissions = [
  {
    id: "M-0992",
    title: "Medical Evacuation Transport",
    region: "Lebanon, Beirut",
    escrowAmount: "210,000 USDC",
    agency: "Regional Health Logistics",
    donor: "Global Health Fund",
    disputeReason: "Donor claims delivery timeline exceeded contract limit by 72 hours, invalidating the SLA.",
    agencyResponse: "Border closure delayed transport; force majeure clause applies.",
  },
];

export default function ArbiterDashboardPage() {
  return (
    <AppShell currentPath="/missions">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
            Arbiter Workspace
          </span>
          <h1 className="font-(family-name:--font-fraunces) text-4xl font-semibold text-slate-50 md:text-5xl">
            United Nations Arbiter
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Resolve contested deliveries. Your cryptographic signature forces the smart contract to either release the escrow to the agency or refund the donor.
          </p>
        </div>

        {/* Arbiter Action Board */}
        <section className="animate-fade-in-up delay-100">
          <h2 className="mb-6 text-xl font-semibold text-slate-100 flex items-center gap-3">
            Action Required: Resolve Disputes
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs text-rose-300 border border-rose-500/30">
              {mockDisputedMissions.length}
            </span>
          </h2>
          
          {mockDisputedMissions.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
              <span className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400 text-xl font-bold">✓</span>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">No active disputes</h3>
              <p className="text-slate-400">All escrow workflows are currently proceeding normally.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {mockDisputedMissions.map((mission) => (
                <div key={mission.id} className="glass-panel rounded-3xl p-6 lg:p-8 border-l-4 border-rose-500">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mission Context */}
                    <div className="flex-1">
                      <div className="flex gap-3 mb-3">
                        <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                          {mission.id}
                        </span>
                        <span className="text-sm font-medium text-rose-400 border border-rose-400/20 bg-rose-400/10 px-2.5 py-0.5 rounded-full animate-pulse">
                          Disputed
                        </span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-100 mb-2">{mission.title}</h3>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Donor</p>
                          <p className="text-sm text-slate-300">{mission.donor}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Agency</p>
                          <p className="text-sm text-slate-300">{mission.agency}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dispute Details & Actions */}
                    <div className="flex-1 lg:max-w-md flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                      <div className="mb-6">
                        <div className="mb-4">
                          <p className="text-[10px] text-rose-400 uppercase tracking-widest mb-1">Donor Claim</p>
                          <p className="text-sm text-slate-300 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">{mission.disputeReason}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Agency Response</p>
                          <p className="text-sm text-slate-400 bg-white/5 p-3 rounded-lg">{mission.agencyResponse}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-4">
                          <p className="text-xs text-slate-400 uppercase tracking-widest">Contested Escrow</p>
                          <p className="text-xl font-mono text-slate-200 font-bold">{mission.escrowAmount}</p>
                        </div>
                        <div className="flex w-full gap-3">
                          <button className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-3 text-xs font-semibold text-slate-300 transition-colors">
                            Refund Donor
                          </button>
                          <button className="flex-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-3 text-xs font-semibold text-rose-300 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                            Release to Agency
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
